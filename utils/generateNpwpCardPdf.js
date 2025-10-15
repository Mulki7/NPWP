const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a Buffer containing the NPWP card PDF for a user and biodata
 * @param {Object} biodata - Biodata object (must have npwp, nama, nik)
 * @param {Object} user - User object (must have created_at)
 * @returns {Promise<Buffer>} - Resolves to PDF buffer
 */
async function generateNpwpCardPdf(biodata, user) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: [380, 240], margin: 0 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Background gradient effect dengan warna modern
            doc.rect(0, 0, 380, 240).fill('#0A2463');
            
            // Accent shape - modern geometric element
            doc.save();
            doc.circle(350, 30, 80).fill('#1E3A8A').opacity(0.3);
            doc.circle(-20, 200, 100).fill('#1E3A8A').opacity(0.3);
            doc.restore();

            // Top section dengan accent bar
            doc.rect(0, 0, 380, 4).fill('#3B82F6');

            // Logo dan header section
            const logoPath = path.join(__dirname, '../assets/pajak.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 25, 20, { width: 35 });
            }

            // Title - modern typography
            doc.fontSize(11)
               .fillColor('#9CA3AF')
               .font('Helvetica')
               .text('KEMENTERIAN KEUANGAN RI', 70, 22);
            
            doc.fontSize(16)
               .fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .text('KARTU NPWP DIGITAL', 70, 38);

            // NPWP Number - featured section dengan background
            doc.roundedRect(25, 75, 330, 50, 10)
               .fillOpacity(0.15)
               .fill('#FFFFFF');
            
            doc.fillOpacity(1)
               .fontSize(10)
               .fillColor('#CBD5E1')
               .font('Helvetica')
               .text('Nomor Pokok Wajib Pajak', 40, 85);
            
            doc.fontSize(24)
               .fillColor('#60A5FA')
               .font('Helvetica-Bold')
               .text(formatNPWP(biodata.npwp), 40, 102);

            // Data section - clean card design
            doc.roundedRect(25, 140, 330, 75, 10)
               .fillOpacity(0.1)
               .fillAndStroke('#FFFFFF', '#3B82F6')
               .lineWidth(1);
            
            doc.fillOpacity(1);

            // Data rows dengan spacing yang lebih baik
            const dataY = 152;
            const lineHeight = 23;

            // Nama
            doc.fontSize(9)
               .fillColor('#94A3B8')
               .font('Helvetica')
               .text('Nama', 40, dataY);
            doc.fontSize(11)
               .fillColor('#F1F5F9')
               .font('Helvetica-Bold')
               .text(biodata.nama, 140, dataY - 1);

            // NIK
            doc.fontSize(9)
               .fillColor('#94A3B8')
               .font('Helvetica')
               .text('NIK', 40, dataY + lineHeight);
            doc.fontSize(11)
               .fillColor('#F1F5F9')
               .font('Helvetica')
               .text(biodata.nik, 140, dataY + lineHeight - 1);

            // Tanggal Daftar
            const tgl = user.created_at instanceof Date 
                ? user.created_at.toISOString().slice(0, 10) 
                : String(user.created_at).slice(0, 10);
            
            doc.fontSize(9)
               .fillColor('#94A3B8')
               .font('Helvetica')
               .text('Terdaftar', 40, dataY + lineHeight * 2);
            doc.fontSize(11)
               .fillColor('#F1F5F9')
               .font('Helvetica')
               .text(formatDate(tgl), 140, dataY + lineHeight * 2 - 1);

            // Footer
            doc.fontSize(8)
               .fillColor('#64748B')
               .font('Helvetica')
               .text('Direktorat Jenderal Pajak', 25, 222);
            
            doc.fontSize(8)
               .fillColor('#64748B')
               .font('Helvetica')
               .text('npwp.pajak.go.id', 300, 222);

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Format NPWP dengan separator untuk readability
 * @param {string} npwp - NPWP string
 * @returns {string} - Formatted NPWP
 */
function formatNPWP(npwp) {
    // Format: 09.308.503.0-456.466
    const clean = npwp.replace(/\D/g, '');
    if (clean.length === 15) {
        return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}.${clean.slice(8, 9)}-${clean.slice(9, 12)}.${clean.slice(12, 15)}`;
    }
    return npwp;
}

/**
 * Format date untuk tampilan yang lebih baik
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const parts = date.split('-');
    if (parts.length === 3) {
        const month = months[parseInt(parts[1]) - 1];
        return `${parts[2]} ${month} ${parts[0]}`;
    }
    return date;
}

module.exports = generateNpwpCardPdf;