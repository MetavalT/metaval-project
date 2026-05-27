/**
 * Advanced Type-Aware Translation Matcher Engine
 * @param {Array<Object>} columnDiscoveryRows - Raw schema row definitions directly from database catalog tables.
 * @param {string} extractedText - Clean raw string text parsed out of document uploads.
 * @param {Object} fileMeta - Multer uploaded file data payload.
 * @returns {Array<any>} Ordered database parameter arguments ready for insertion.
 */
const mapTextToColumnsStrategy = (columnDiscoveryRows, extractedText, fileMeta) => {
  let queryValues = [];
  const cleanText = extractedText ? extractedText.replace(/\s+/g, ' ') : '';

  // 🎯 Filter out auto-managed operational parameters to keep column array lengths balanced
  const targetInsertionColumns = columnDiscoveryRows.filter(col => {
    if (!col || !col.column_name) return false;
    const name = col.column_name.toLowerCase();
    return name !== 'id' && name !== 'created_at';
  });

  // 📋 Dictionary mapping terminology directly to standard operational targets
  const dictionaryMapping = {
    date: /(?:execution date|date|received on|timestamp|order date|invoice date)\s*[:\-]?\s*([^\n\r,;]+)/i,
    client: /(?:client|customer|sold to|bill to|vendor|supplier|company)\s*[:\-]?\s*([^\n\r,;]+)/i,
    product_name: /(?:product name|product|item|description|assembly|model|part description)\s*[:\-]?\s*([^\n\r,;]+)/i
  };

  targetInsertionColumns.forEach(colObject => {
    const column = colObject.column_name;
    const dataType = colObject.data_type ? String(colObject.data_type).toLowerCase() : 'text';
    const normalizedCol = column.toLowerCase().trim();

    // A. Match against core structural target indicators
    if (normalizedCol === 'date') {
      const dateRegex = dictionaryMapping.date;
      const match = cleanText.match(dateRegex);
      if (match) {
        queryValues.push(match[1].trim().substring(0, 50));
      } else {
        const genericDate = cleanText.match(/\b\d{2}[-/.]\d{2}[-/.]\d{4}\b|\b\d{4}[-/.]\d{2}[-/.]\d{2}\b/);
        queryValues.push(genericDate ? genericDate[0] : new Date());
      }
    } 
    else if (normalizedCol === 'client') {
      const clientRegex = dictionaryMapping.client;
      const match = cleanText.match(clientRegex);
      queryValues.push(match ? match[1].trim().substring(0, 100) : "Ingested Manufacturing Partner");
    } 
    else if (normalizedCol === 'product_name') {
      const prodRegex = dictionaryMapping.product_name;
      const match = cleanText.match(prodRegex);
      queryValues.push(match ? match[1].trim().substring(0, 100) : "Mechanical Component Asset");
    } 
    else if (normalizedCol === 'file_attachment') {
      queryValues.push(extractedText || `Original File: ${fileMeta.originalname}`);
    }
    else if (normalizedCol === 'filename' || normalizedCol === 'name') {
      queryValues.push(fileMeta.originalname);
    } 
    else if (normalizedCol === 'source_type') {
      queryValues.push('PDF');
    } 
    // B. Safe Parsing Strategy for Numeric Parameters (Enforces robust types)
    else if (dataType.includes('int') || dataType.includes('num') || dataType.includes('double') || dataType.includes('float')) {
      const foundNumbers = cleanText.match(/\b\d+(?:\.\d+)?\b/);
      queryValues.push(foundNumbers ? parseFloat(foundNumbers[0]) : 0);
    }
    // C. General Text Column Fallback Strategy
    else {
      queryValues.push(cleanText.substring(0, 40).trim() || "Parsed Parameter Value");
    }
  });

  return queryValues;
};

module.exports = { mapTextToColumnsStrategy };