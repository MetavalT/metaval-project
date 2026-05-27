import sys
import os
import json
import pdfplumber

def extract_spatial_document_canvas(file_path):
    if not os.path.exists(file_path):
        return {"success": False, "error": f"Target document not found at: {file_path}"}
        
    markdown_buffer = []
    
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_idx, page in enumerate(pdf.pages, 1):
                markdown_buffer.append(f"\n\n")
                
                # Extract structural tables to prevent left-to-right column bleeding
                tables = page.extract_tables()
                if tables:
                    for table_grid in tables:
                        for table_row in table_grid:
                            cleaned_cells = [str(cell).strip().replace("\n", " ") if cell else "" for cell in table_row]
                            markdown_buffer.append("| " + " | ".join(cleaned_cells) + " |")
                
                # Append raw textual canvas flow
                raw_text = page.extract_text()
                if raw_text:
                    markdown_buffer.append(raw_text)
                    
        return {"success": True, "payload": "\n".join(markdown_buffer)}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path parameter passed."}))
        sys.exit(1)
        
    result = extract_spatial_document_canvas(sys.argv[1])
    print(json.dumps(result))