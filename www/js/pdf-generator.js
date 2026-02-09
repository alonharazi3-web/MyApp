/**
 * Lightweight PDF Generator v1.0
 * Creates PDF from JPEG image - NO external dependencies
 * Replaces jsPDF CDN dependency for offline Cordova use
 * 
 * Generates a valid PDF 1.4 with embedded JPEG on A4 page
 */

export class PDFGenerator {
    /**
     * Generate a PDF containing a JPEG image fitted to A4 page
     * @param {string} base64Jpeg - Raw base64 JPEG data (no data: prefix)
     * @returns {string} Raw base64 PDF data
     */
    static generate(base64Jpeg) {
        // A4 dimensions in PDF points (1 point = 1/72 inch)
        const PAGE_W = 595.28; // 210mm
        const PAGE_H = 841.89; // 297mm
        const MARGIN = 14.17;  // 5mm margin

        // Decode base64 to binary
        const jpegBinary = atob(base64Jpeg);
        const jpegBytes = new Uint8Array(jpegBinary.length);
        for (let i = 0; i < jpegBinary.length; i++) {
            jpegBytes[i] = jpegBinary.charCodeAt(i);
        }

        // Parse JPEG dimensions from headers
        const { width, height } = PDFGenerator._getJpegDimensions(jpegBytes);

        // Calculate image placement (fit to page with margin)
        const maxW = PAGE_W - (MARGIN * 2);
        const maxH = PAGE_H - (MARGIN * 2);
        const ratio = width / height;
        let imgW, imgH;

        if (ratio > maxW / maxH) {
            imgW = maxW;
            imgH = maxW / ratio;
        } else {
            imgH = maxH;
            imgW = maxH * ratio;
        }

        // Center on page
        const x = (PAGE_W - imgW) / 2;
        const y = (PAGE_H - imgH) / 2;

        // Build PDF structure
        const objects = [];
        const offsets = [];

        // Helper to add an object
        const addObj = (content) => {
            const num = objects.length + 1;
            objects.push(content);
            return num;
        };

        // Object 1: Catalog
        addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

        // Object 2: Pages
        addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

        // Object 3: Page
        addObj(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Img 5 0 R >> >> >>\nendobj\n`);

        // Object 4: Content stream (draw image command)
        const contentStream = `q\n${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Img Do\nQ`;
        addObj(`4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

        // Object 5: Image XObject (JPEG)
        const imgObj = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
        addObj(imgObj); // Will append binary + endstream separately

        // Assemble PDF bytes
        const header = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';
        const headerBytes = PDFGenerator._strToBytes(header);

        // Calculate all parts
        const parts = [];
        parts.push(headerBytes);

        // Objects 1-4 (text only)
        for (let i = 0; i < 4; i++) {
            offsets.push(PDFGenerator._totalLength(parts));
            parts.push(PDFGenerator._strToBytes(objects[i]));
        }

        // Object 5 (image - mixed text and binary)
        offsets.push(PDFGenerator._totalLength(parts));
        parts.push(PDFGenerator._strToBytes(objects[4])); // header part
        parts.push(jpegBytes);                              // binary JPEG data
        parts.push(PDFGenerator._strToBytes('\nendstream\nendobj\n'));

        // Cross-reference table
        const xrefOffset = PDFGenerator._totalLength(parts);
        let xref = `xref\n0 ${objects.length + 1}\n`;
        xref += '0000000000 65535 f \n';
        for (let i = 0; i < offsets.length; i++) {
            xref += offsets[i].toString().padStart(10, '0') + ' 00000 n \n';
        }

        // Trailer
        xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
        xref += `startxref\n${xrefOffset}\n%%EOF`;

        parts.push(PDFGenerator._strToBytes(xref));

        // Merge all parts into single Uint8Array
        const totalLen = PDFGenerator._totalLength(parts);
        const pdf = new Uint8Array(totalLen);
        let offset = 0;
        for (const part of parts) {
            pdf.set(part, offset);
            offset += part.length;
        }

        // Convert to base64
        return PDFGenerator._bytesToBase64(pdf);
    }

    /**
     * Parse JPEG SOF marker to get image dimensions
     */
    static _getJpegDimensions(bytes) {
        let i = 0;
        // Verify JPEG magic bytes
        if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
            // Fallback dimensions if not valid JPEG header
            return { width: 2480, height: 3508 };
        }

        i = 2;
        while (i < bytes.length - 1) {
            if (bytes[i] !== 0xFF) { i++; continue; }
            const marker = bytes[i + 1];

            // SOF markers (Start of Frame)
            if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
                // SOF segment: length(2) + precision(1) + height(2) + width(2)
                const height = (bytes[i + 5] << 8) | bytes[i + 6];
                const width = (bytes[i + 7] << 8) | bytes[i + 8];
                return { width, height };
            }

            // Skip segment
            if (marker === 0xD0 || marker === 0xD1 || marker === 0xD2 || marker === 0xD3 ||
                marker === 0xD4 || marker === 0xD5 || marker === 0xD6 || marker === 0xD7 ||
                marker === 0xD8 || marker === 0xD9) {
                i += 2;
            } else {
                const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
                i += 2 + segLen;
            }
        }

        // Fallback
        return { width: 2480, height: 3508 };
    }

    /**
     * Convert string to Uint8Array (Latin-1 encoding)
     */
    static _strToBytes(str) {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i) & 0xFF;
        }
        return bytes;
    }

    /**
     * Get total length of array of Uint8Arrays
     */
    static _totalLength(parts) {
        let len = 0;
        for (const p of parts) len += p.length;
        return len;
    }

    /**
     * Convert Uint8Array to base64 string
     */
    static _bytesToBase64(bytes) {
        // Process in chunks to avoid call stack overflow
        const CHUNK = 32768;
        let binary = '';
        for (let i = 0; i < bytes.length; i += CHUNK) {
            const chunk = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }
}
