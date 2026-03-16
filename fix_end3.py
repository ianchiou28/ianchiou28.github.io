with open("main.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.strip() == "});%":
        continue
    new_lines.append(line)

with open("main.js", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
