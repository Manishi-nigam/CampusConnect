import os
import re

entity_dir = r"c:\Users\manis\OneDrive\Desktop\fullstack\CampusConnect\Connect-Backend\connect\src\main\java\CampusConnect\Application\connect\entity"

for filename in os.listdir(entity_dir):
    if not filename.endswith(".java"):
        continue
    filepath = os.path.join(entity_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if we have @Getter or @Setter
    if "@Getter" not in content and "@Setter" not in content and "@Data" not in content:
        continue
    
    # Remove lombok imports
    content = re.sub(r'import lombok\..*;\n?', '', content)
    
    # Remove class level lombok annotations
    content = re.sub(r'@Data\s*\n?', '', content)
    content = re.sub(r'@Getter\s*\n?', '', content)
    content = re.sub(r'@Setter\s*\n?', '', content)
    content = re.sub(r'@NoArgsConstructor\s*\n?', '', content)
    content = re.sub(r'@AllArgsConstructor\s*\n?', '', content)
    content = re.sub(r'@Builder\s*\n?', '', content)
    
    # Find all fields
    # simple regex for fields: private Type name; or private Type name = value;
    field_pattern = re.compile(r'private\s+([\w<>,\s]+?)\s+(\w+)(?:\s*=\s*[^;]+)?\s*;')
    fields = field_pattern.findall(content)
    
    getters_setters = []
    
    for field_type, field_name in fields:
        field_type = field_type.strip()
        
        # Capitalize first letter
        cap_name = field_name[0].upper() + field_name[1:]
        
        # Getter
        prefix = "is" if field_type.lower() == "boolean" else "get"
        getter = f"""
    public {field_type} {prefix}{cap_name}() {{
        return this.{field_name};
    }}
"""
        getters_setters.append(getter)
        
        # Setter
        setter = f"""
    public void set{cap_name}({field_type} {field_name}) {{
        this.{field_name} = {field_name};
    }}
"""
        getters_setters.append(setter)
    
    methods_str = "\n".join(getters_setters)
    
    # Insert before the last closing brace
    last_brace_idx = content.rfind('}')
    if last_brace_idx != -1:
        content = content[:last_brace_idx] + methods_str + "\n}\n"
    
    # Constructors?
    # we might need no args constructor
    class_name = filename[:-5]
    if "public class " + class_name in content:
        # Check if no-arg constructor exists
        if f"public {class_name}()" not in content:
            content = content[:last_brace_idx] + f"\n    public {class_name}() {{}}\n" + content[last_brace_idx:]
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Processed {filename}")
