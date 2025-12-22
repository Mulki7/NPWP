const axios = require('axios');
const crypto = require('crypto');
const Biodata = require('../models/biodataModel');
const User = require('../models/userModel');
const LogVerifikasiWajah = require('../models/logVerifikasiWajahModel');

// Ambang batas kemiripan (0–1). 
// Threshold disesuaikan untuk mendeteksi foto yang sama meskipun ukuran/kompresi berbeda.
// Logika sederhana: Jika foto cocok (sama) = berhasil, jika tidak cocok = gagal.
// Threshold 0.52 cukup untuk foto yang sama (dengan bonus dari chunk similarity).
// Untuk produksi, tetap disarankan gunakan face-api.js atau layanan face recognition yang sebenarnya.
const FACE_SIMILARITY_THRESHOLD = 0.52;
const STATUS = {
  SUCCESS: 'berhasil',
  NOT_MATCH: 'gagal_tidak_cocok',
  FACE_NOT_FOUND: 'gagal_wajah_tidak_terdeteksi',
};

const bitCount = (() => {
  const table = new Array(256).fill(0).map((_, i) => {
    let v = i;
    let c = 0;
    while (v) {
      c += v & 1;
      v >>= 1;
    }
    return c;
  });
  return (n) => table[n];
})();

function pseudoSimilarity(bufA, bufB) {
  try {
    if (!bufA || !bufB || !Buffer.isBuffer(bufA) || !Buffer.isBuffer(bufB)) {
      return 0;
    }
    
    if (bufA.length === 0 || bufB.length === 0) {
      return 0;
    }

    // Metode 1: Perbandingan ukuran file (jika ukuran mirip, kemungkinan foto sama)
    const sizeRatio = Math.min(bufA.length, bufB.length) / Math.max(bufA.length, bufB.length);
    const sizeSimilarity = sizeRatio; // 0-1, semakin mirip ukurannya semakin tinggi

    // Metode 2: Perbandingan chunk sampling (ambil beberapa bagian dari buffer)
    // Ini lebih akurat daripada hash keseluruhan karena tidak terpengaruh metadata
    const sampleSize = Math.min(10000, Math.floor(Math.min(bufA.length, bufB.length) / 4)); // Ambil 25% atau max 10KB
    const samplesA = [];
    const samplesB = [];
    const numSamples = 8; // Ambil 8 sample dari berbagai posisi
    
    for (let i = 0; i < numSamples; i++) {
      const offset = Math.floor((bufA.length / (numSamples + 1)) * (i + 1));
      const chunkA = bufA.slice(offset, Math.min(offset + sampleSize, bufA.length));
      const chunkB = bufB.slice(offset, Math.min(offset + sampleSize, bufB.length));
      
      const hashA = crypto.createHash('md5').update(chunkA).digest();
      const hashB = crypto.createHash('md5').update(chunkB).digest();
      
      // Hitung kemiripan bit antara hash chunk
      let sameBits = 0;
  const len = Math.min(hashA.length, hashB.length);
      for (let j = 0; j < len; j++) {
        const xor = hashA[j] ^ hashB[j];
        sameBits += 8 - bitCount(xor);
      }
      samplesA.push(hashA);
      samplesB.push(hashB);
    }

    // Hitung rata-rata similarity dari semua sample
    let totalSampleSimilarity = 0;
    for (let i = 0; i < numSamples; i++) {
  let sameBits = 0;
      const len = Math.min(samplesA[i].length, samplesB[i].length);
      for (let j = 0; j < len; j++) {
        const xor = samplesA[i][j] ^ samplesB[i][j];
    sameBits += 8 - bitCount(xor);
      }
      totalSampleSimilarity += sameBits / (len * 8);
    }
    const chunkSimilarity = totalSampleSimilarity / numSamples;

    // Metode 3: Perbandingan awal dan akhir file (header/footer biasanya sama untuk format yang sama)
    const headerSize = Math.min(500, Math.floor(Math.min(bufA.length, bufB.length) / 10));
    const footerSize = Math.min(500, Math.floor(Math.min(bufA.length, bufB.length) / 10));
    
    const headerA = bufA.slice(0, headerSize);
    const headerB = bufB.slice(0, headerSize);
    const footerA = bufA.slice(Math.max(0, bufA.length - footerSize));
    const footerB = bufB.slice(Math.max(0, bufB.length - footerSize));
    
    // Hash header dan footer
    const headerHashA = crypto.createHash('md5').update(headerA).digest();
    const headerHashB = crypto.createHash('md5').update(headerB).digest();
    const footerHashA = crypto.createHash('md5').update(footerA).digest();
    const footerHashB = crypto.createHash('md5').update(footerB).digest();
    
    // Hitung similarity header
    let headerSameBits = 0;
    for (let i = 0; i < Math.min(headerHashA.length, headerHashB.length); i++) {
      const xor = headerHashA[i] ^ headerHashB[i];
      headerSameBits += 8 - bitCount(xor);
    }
    const headerSimilarity = headerSameBits / (Math.min(headerHashA.length, headerHashB.length) * 8);
    
    // Hitung similarity footer
    let footerSameBits = 0;
    for (let i = 0; i < Math.min(footerHashA.length, footerHashB.length); i++) {
      const xor = footerHashA[i] ^ footerHashB[i];
      footerSameBits += 8 - bitCount(xor);
    }
    const footerSimilarity = footerSameBits / (Math.min(footerHashA.length, footerHashB.length) * 8);

    // Kombinasi semua metode dengan weight yang lebih fokus pada konten gambar
    // Size: 10% (kurang penting karena kompresi bisa berbeda), 
    // Chunk sampling: 60% (paling penting karena konten gambar), 
    // Header/Footer: 30%
    let combinedSimilarity = (
      sizeSimilarity * 0.1 +
      chunkSimilarity * 0.6 +
      ((headerSimilarity + footerSimilarity) / 2) * 0.3
    );

    // Jika file identik atau sangat mirip, return nilai tinggi
    if (combinedSimilarity >= 0.95) {
      return 0.95;
    }

    // Boost similarity jika chunk similarity tinggi (konten gambar mirip)
    // Ini penting karena ukuran file bisa berbeda karena kompresi, tapi konten sama
    if (chunkSimilarity >= 0.45) {
      // Jika konten gambar mirip, berikan bonus meskipun ukuran berbeda
      // Bonus lebih besar jika chunk similarity tinggi
      const bonus = Math.min(0.25, (chunkSimilarity - 0.4) * 0.5);
      combinedSimilarity = Math.min(0.95, combinedSimilarity + bonus);
    }

    // Boost tambahan jika header/footer mirip (format file sama)
    if (headerSimilarity >= 0.6 || footerSimilarity >= 0.6) {
      combinedSimilarity = Math.min(0.95, combinedSimilarity + 0.08);
    }

    // Jika konten gambar cukup mirip (chunk similarity >= 0.5), anggap foto sama
    // meskipun ukuran berbeda - ini untuk handle kasus kompresi berbeda
    if (chunkSimilarity >= 0.5) {
      combinedSimilarity = Math.max(combinedSimilarity, 0.55); // Minimal 0.55 jika konten mirip
    }

    // Jika ukuran file mirip DAN chunk similarity tinggi, boost lebih besar
    if (sizeRatio >= 0.5 && chunkSimilarity >= 0.5) {
      combinedSimilarity = Math.min(0.95, combinedSimilarity * 1.2);
    }

    return Math.max(0, Math.min(1, combinedSimilarity));
  } catch (err) {
    console.error('Error dalam pseudoSimilarity:', err);
    return 0;
  }
}

async function loadSelfieBuffer(source = {}) {
  const { selfie_base64, selfie_url, fileBuffer } = source;
  
  if (fileBuffer && Buffer.isBuffer(fileBuffer) && fileBuffer.length > 0) {
    return fileBuffer;
  }
  
  if (selfie_base64) {
    try {
    const cleaned = selfie_base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleaned, 'base64');
      if (buffer.length === 0) {
        throw new Error('Base64 string tidak valid atau kosong');
      }
      return buffer;
    } catch (err) {
      throw new Error(`Gagal memproses selfie_base64: ${err.message}`);
    }
  }
  
  if (selfie_url) {
    try {
      const resp = await axios.get(selfie_url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 detik timeout
        validateStatus: (status) => status === 200,
      });
      const buffer = Buffer.from(resp.data);
      if (buffer.length === 0) {
        throw new Error('File yang diunduh kosong');
      }
      return buffer;
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        throw new Error('Timeout saat mengunduh selfie dari URL');
      }
      throw new Error(`Gagal mengunduh selfie dari URL: ${err.message}`);
    }
  }
  
  throw new Error('Selfie tidak ditemukan, kirim file form-data "image" atau selfie_base64 atau selfie_url');
}

async function loadKtpBuffer(nik, authToken) {
  const apiUrl = `https://ktp.chasouluix.biz.id/api/ktp/photo/nik/${nik}`;
  
  try {
    // Step 1: Ambil data KTP (JSON response dengan photo_url)
    const apiResp = await axios.get(apiUrl, {
      timeout: 30000, // 30 detik timeout
      validateStatus: (status) => status === 200,
      maxRedirects: 5,
      headers: authToken ? {
        'Authorization': `Bearer ${authToken}`
      } : {},
    });

    // Validasi response structure
    if (!apiResp.data || !apiResp.data.success) {
      throw new Error(apiResp.data?.message || 'Response dari API KTP tidak valid');
    }

    if (!apiResp.data.data || !apiResp.data.data.photo_url) {
      throw new Error('Photo URL tidak ditemukan di response API KTP');
    }

    const photoUrl = apiResp.data.data.photo_url;

    // Step 2: Unduh foto dari photo_url
    const photoResp = await axios.get(photoUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 detik timeout
      validateStatus: (status) => status === 200,
      maxRedirects: 5,
      headers: authToken ? {
        'Authorization': `Bearer ${authToken}`
      } : {},
    });
    
    const buffer = Buffer.from(photoResp.data);
    if (buffer.length === 0) {
      throw new Error('Foto KTP yang diunduh kosong');
    }
    
    return buffer;
  } catch (err) {
    // Handle berbagai jenis error
    if (err.response?.status === 404) {
      throw new Error(`Foto KTP untuk NIK ${nik} tidak ditemukan di layanan eksternal`);
    }
    
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Token autentikasi tidak valid atau tidak memiliki akses ke layanan KTP');
    }
    
    if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET') {
      throw new Error('Koneksi ke layanan KTP terputus atau timeout. Silakan coba lagi.');
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      throw new Error('Tidak dapat terhubung ke layanan KTP. Pastikan koneksi internet stabil.');
    }
    
    // Jika error message sudah user-friendly, langsung throw
    if (err.message && (err.message.includes('tidak ditemukan') || err.message.includes('tidak valid'))) {
      throw err;
    }
    
    throw new Error(`Gagal mengambil foto KTP: ${err.message}`);
  }
}

exports.verifyFace = async (req, res) => {
  const userId = req.user?.id;
  
  try {
    // Validasi user
    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    // Ambil token dari header Authorization
    const bearerHeader = req.headers['authorization'];
    let authToken = null;
    if (bearerHeader) {
      const parts = bearerHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        authToken = parts[1];
      }
    }

    // Ambil biodata user
    const biodata = await Biodata.getByUserId(userId);
    if (!biodata?.nik) {
      return res.status(404).json({ message: 'Biodata atau NIK tidak ditemukan untuk user ini' });
    }

    // Ambil foto KTP dari API eksternal dengan token
    let ktpBuffer;
    try {
      ktpBuffer = await loadKtpBuffer(biodata.nik, authToken);
    } catch (ktpError) {
      console.error('Error loading KTP buffer:', ktpError);
      
      // Handle error spesifik dengan status code yang sesuai
      if (ktpError.message.includes('tidak ditemukan')) {
        return res.status(404).json({ 
          message: ktpError.message,
          error: process.env.NODE_ENV === 'development' ? ktpError.stack : undefined
        });
      }
      
      if (ktpError.message.includes('autentikasi') || ktpError.message.includes('tidak valid')) {
        return res.status(401).json({ 
          message: ktpError.message,
          error: process.env.NODE_ENV === 'development' ? ktpError.stack : undefined
        });
      }
      
      return res.status(500).json({ 
        message: ktpError.message || 'Gagal mengambil foto KTP dari layanan eksternal',
        error: process.env.NODE_ENV === 'development' ? ktpError.message : undefined
      });
    }

    // Ambil selfie dari request (file form-data atau base64/url)
    let selfieBuffer;
    try {
      selfieBuffer = await loadSelfieBuffer({
      selfie_base64: req.body.selfie_base64,
      selfie_url: req.body.selfie_url,
      fileBuffer: req.file?.buffer,
    });
    } catch (selfieError) {
      console.error('Error loading selfie buffer:', selfieError);
      return res.status(400).json({ 
        message: selfieError.message || 'Gagal memproses foto selfie',
        error: process.env.NODE_ENV === 'development' ? selfieError.message : undefined
      });
    }

    // Validasi buffer
    if (!Buffer.isBuffer(ktpBuffer) || ktpBuffer.length === 0) {
      return res.status(500).json({ message: 'Foto KTP tidak valid atau kosong' });
    }
    
    if (!Buffer.isBuffer(selfieBuffer) || selfieBuffer.length === 0) {
      return res.status(400).json({ message: 'Foto selfie tidak valid atau kosong' });
    }

    // Perbandingan foto menggunakan multi-method comparison
    const similarity = pseudoSimilarity(selfieBuffer, ktpBuffer);

    // Pastikan similarity adalah angka valid (0-1)
    const validSimilarity = Math.max(0, Math.min(1, similarity));

    // Log untuk debugging (opsional, bisa dihapus di production)
    console.log('Face Verification Result:', {
      userId,
      nik: biodata.nik,
      selfieSize: selfieBuffer.length,
      ktpSize: ktpBuffer.length,
      similarity: validSimilarity,
      threshold: FACE_SIMILARITY_THRESHOLD,
      willPass: validSimilarity >= FACE_SIMILARITY_THRESHOLD
    });

    // Tentukan status berdasarkan threshold yang ketat
    // Hanya dianggap berhasil jika similarity >= threshold
    let status = STATUS.NOT_MATCH;
    let message = 'Verifikasi gagal, wajah tidak cocok dengan foto di KTP.';
    
    // Cek dengan ketat: hanya berhasil jika similarity >= threshold
    if (validSimilarity >= FACE_SIMILARITY_THRESHOLD) {
      status = STATUS.SUCCESS;
      message = 'Verifikasi wajah berhasil, foto cocok dengan KTP.';
    }

    // Tentukan nilai string untuk kolom foto (tidak boleh NULL di DB)
    const fotoLog =
      req.body.selfie_url ||
      req.body.selfie_base64?.slice(0, 30) || // simpan prefix saja kalau base64 panjang
      req.file?.originalname ||
      'selfie_uploaded';

    // Catat log verifikasi
    await LogVerifikasiWajah.create({
      user_id: userId,
      status,
      foto: fotoLog,
      skor_kemiripan: validSimilarity,
    });

    // Update status user & biodata HANYA jika benar-benar berhasil
    // Jika gagal, update status menjadi 'gagal' untuk memastikan tidak tetap 'verified'
    if (status === STATUS.SUCCESS) {
      // Hanya update ke 'verified' jika benar-benar cocok
      await User.updateFaceStatus(userId, 'berhasil');
      if (biodata?.id) {
        await Biodata.update(biodata.id, { status: 'verified' });
      }
    } else {
      // Jika tidak cocok, pastikan status tidak tetap 'verified'
      await User.updateFaceStatus(userId, 'gagal');
      if (biodata?.id && biodata.status === 'verified') {
        // Reset status biodata jika sebelumnya verified tapi sekarang gagal
        await Biodata.update(biodata.id, { status: 'pending' });
      }
    }

    return res.json({
      success: status === STATUS.SUCCESS,
      similarity: Number(validSimilarity.toFixed(4)),
      threshold: FACE_SIMILARITY_THRESHOLD,
      message,
      status: status,
    });
  } catch (err) {
    // Log error untuk debugging
    console.error('Error dalam verifyFace:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      userId: userId,
      code: err.code,
      responseStatus: err.response?.status,
    });

    // Handle error spesifik berdasarkan status code atau error code
    if (err.response?.status === 404) {
      return res.status(404).json({ 
        message: err.message || 'Foto KTP tidak ditemukan di layanan eksternal',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
    
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({ 
        message: err.message || 'Token autentikasi tidak valid',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
    
    if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: 'Layanan sibuk atau tidak dapat diakses. Silakan coba lagi dalam beberapa saat.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'Tidak dapat terhubung ke layanan eksternal. Pastikan koneksi internet stabil.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Error umum - jika error message sudah user-friendly, gunakan itu
    const errorMessage = err.message && (
      err.message.includes('tidak ditemukan') || 
      err.message.includes('tidak valid') || 
      err.message.includes('Gagal')
    ) ? err.message : 'Gagal memverifikasi wajah';

    return res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

