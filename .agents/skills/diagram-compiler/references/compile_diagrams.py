#!/usr/bin/env python3
# /// script
# requires-python = ">=3.8"
# ///
import os
import re
import sys
import subprocess
import argparse
import shutil

def parse_args():
    parser = argparse.ArgumentParser(description="Compile PlantUML and Mermaid diagrams embedded in markdown files.")
    parser.add_argument("--src", default=".", help="Source file or directory to scan (recursively). Default is '.'")
    parser.add_argument("--out", default="Figure", help="Output directory name for generated images. Relative to the scanned markdown file. Default is 'Figure'")
    parser.add_argument("--format", default="png", choices=["png", "svg"], help="Output image format. Default is 'png'")
    parser.add_argument("--type", default="both", choices=["plantuml", "mermaid", "both"], help="Diagram types to compile. Default is 'both'")
    parser.add_argument("--relative-path", default="../Figure", help="Relative path prefix to use in the replaced markdown image links. Default is '../Figure'")
    return parser.parse_args()

def check_dependencies():
    plantuml_ok = shutil.which("plantuml") is not None
    mermaid_ok = shutil.which("mmdc") is not None
    return plantuml_ok, mermaid_ok

def process_file(file_path, out_dir_name, img_format, diagram_type, relative_path_prefix, plantuml_ok, mermaid_ok):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Search for markdown code blocks
    # Group 1: language (plantuml/puml/mermaid)
    # Group 2: content
    pattern = re.compile(r"```(plantuml|puml|mermaid)\s*\n(.*?)\n```", re.DOTALL | re.IGNORECASE)
    matches = list(pattern.finditer(content))

    if not matches:
        return False

    print(f"Processing {file_path} (found {len(matches)} diagrams)...")

    # Target directory for images, relative to the markdown file
    md_dir = os.path.dirname(file_path)
    figure_dir = os.path.join(md_dir, out_dir_name)
    os.makedirs(figure_dir, exist_ok=True)

    new_content = content
    offset = 0
    updated = False

    for idx, match in enumerate(matches):
        lang = match.group(1).lower()
        code = match.group(2)
        start, end = match.span()

        # Check filter
        if diagram_type == "plantuml" and lang == "mermaid":
            continue
        if diagram_type == "mermaid" and lang in ("plantuml", "puml"):
            continue

        # Parse directives: @id, @alt
        custom_id = None
        custom_alt = None
        
        # Look for directives in comments
        for line in code.splitlines():
            line_strip = line.strip()
            # PlantUML comment style: ' or /' '/
            # Mermaid comment style: %%
            directive_match = re.search(r"(?:'|%%)\s*@id:\s*(.+)$", line_strip)
            if directive_match:
                custom_id = directive_match.group(1).strip()
            directive_alt_match = re.search(r"(?:'|%%)\s*@alt:\s*(.+)$", line_strip)
            if directive_alt_match:
                custom_alt = directive_alt_match.group(1).strip()

        # If not specified, generate fallback
        basename = os.path.splitext(os.path.basename(file_path))[0]
        # Clean basename for ID
        clean_basename = re.sub(r"[^\w\-]", "_", basename)
        
        block_id = custom_id or f"Figure_{clean_basename}_{idx+1}"
        alt_text = custom_alt or f"Diagram {idx+1} from {basename}"

        img_filename = f"{block_id}.{img_format}"
        dest_img_path = os.path.join(figure_dir, img_filename)

        success = False
        if lang in ("plantuml", "puml"):
            if not plantuml_ok:
                print(f"  [Warning] Cannot compile PlantUML for {block_id}: 'plantuml' executable not found.")
                continue
            
            # Check if there is an internal startuml name
            startuml_name = None
            startuml_match = re.search(r"^\s*@startuml\s+(\w+)", code, re.MULTILINE)
            if startuml_match:
                startuml_name = startuml_match.group(1)

            temp_puml = os.path.join(figure_dir, f"temp_{block_id}.puml")
            with open(temp_puml, "w", encoding="utf-8") as temp_f:
                temp_f.write(code)

            try:
                fmt_flag = f"-t{img_format}"
                subprocess.run(["plantuml", fmt_flag, temp_puml], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                # PlantUML outputs based on the startuml name if present, otherwise temp file name
                if startuml_name:
                    generated_name = f"{startuml_name}.{img_format}"
                else:
                    generated_name = f"temp_{block_id}.{img_format}"
                
                generated_path = os.path.join(figure_dir, generated_name)
                if os.path.exists(generated_path):
                    if os.path.exists(dest_img_path):
                        os.remove(dest_img_path)
                    os.rename(generated_path, dest_img_path)
                    success = True
                else:
                    # Fallback check: sometimes it saves in same dir as puml
                    fallback_gen_path = os.path.join(md_dir, generated_name)
                    if os.path.exists(fallback_gen_path):
                        if os.path.exists(dest_img_path):
                            os.remove(dest_img_path)
                        os.rename(fallback_gen_path, dest_img_path)
                        success = True
                    else:
                        print(f"  [Error] Expected generated file {generated_path} not found.")
            except Exception as e:
                print(f"  [Error] Failed running plantuml for {block_id}: {e}")
            finally:
                if os.path.exists(temp_puml):
                    os.remove(temp_puml)

        elif lang == "mermaid":
            if not mermaid_ok:
                print(f"  [Warning] Cannot compile Mermaid for {block_id}: 'mmdc' (mermaid-cli) not found. Run 'npm install -g @mermaid-js/mermaid-cli' to install.")
                continue

            temp_mmd = os.path.join(figure_dir, f"temp_{block_id}.mmd")
            with open(temp_mmd, "w", encoding="utf-8") as temp_f:
                temp_f.write(code)

            try:
                subprocess.run(["mmdc", "-i", temp_mmd, "-o", dest_img_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                success = os.path.exists(dest_img_path)
            except Exception as e:
                print(f"  [Error] Failed running mmdc for {block_id}: {e}")
            finally:
                if os.path.exists(temp_mmd):
                    os.remove(temp_mmd)

        if success:
            print(f"  [Success] Exported diagram to {dest_img_path}")
            # Replace markdown code block with image link
            replacement = f"![{alt_text}]({relative_path_prefix}/{img_filename}){{#{block_id} width=\"100%\"}}"
            new_start = start + offset
            new_end = end + offset
            new_content = new_content[:new_start] + replacement + new_content[new_end:]
            offset += len(replacement) - (end - start)
            updated = True

    if updated:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  [Success] Updated markdown file: {file_path}")
        return True
    return False

def scan_and_process(src_path, out_dir_name, img_format, diagram_type, relative_path_prefix, plantuml_ok, mermaid_ok):
    if os.path.isfile(src_path):
        if src_path.endswith(".md"):
            process_file(src_path, out_dir_name, img_format, diagram_type, relative_path_prefix, plantuml_ok, mermaid_ok)
        else:
            print(f"Error: {src_path} is not a Markdown file.")
    elif os.path.isdir(src_path):
        for root, dirs, files in os.walk(src_path):
            # Skip hidden folders like .git, .agents, node_modules
            dirs[:] = [d for d in dirs if not d.startswith(".") and d != "node_modules"]
            for file in files:
                if file.endswith(".md"):
                    file_path = os.path.join(root, file)
                    process_file(file_path, out_dir_name, img_format, diagram_type, relative_path_prefix, plantuml_ok, mermaid_ok)
    else:
        print(f"Error: path {src_path} not found.")

def main():
    args = parse_args()
    plantuml_ok, mermaid_ok = check_dependencies()
    
    if args.type == "plantuml" and not plantuml_ok:
        print("Error: PlantUML is selected but the 'plantuml' executable was not found.")
        sys.exit(1)
    if args.type == "mermaid" and not mermaid_ok:
        print("Error: Mermaid is selected but the 'mmdc' command was not found. Please install via: npm install -g @mermaid-js/mermaid-cli")
        sys.exit(1)
    if args.type == "both" and not plantuml_ok and not mermaid_ok:
        print("Error: Neither 'plantuml' nor 'mmdc' (mermaid-cli) were found in the path. Please install at least one tool.")
        sys.exit(1)
        
    print("Starting diagram compilation...")
    print(f"  Source path: {args.src}")
    print(f"  Output directory: {args.out}")
    print(f"  Format: {args.format}")
    print(f"  Types: {args.type}")
    print(f"  Relative path prefix in md: {args.relative_path}")
    print(f"  PlantUML binary: {'Available' if plantuml_ok else 'Not Found'}")
    print(f"  Mermaid binary (mmdc): {'Available' if mermaid_ok else 'Not Found'}")
    
    scan_and_process(args.src, args.out, args.format, args.type, args.relative_path, plantuml_ok, mermaid_ok)
    print("Finished processing diagrams.")

if __name__ == "__main__":
    main()
