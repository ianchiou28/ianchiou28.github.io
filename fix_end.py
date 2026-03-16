with open("main.js", "r", encoding="utf-8") as f:
    js = f.read()

# We need to remove the first "});" from the top part since we appended at the end
# The original file ended with }); so now we have two }); at the end.
lines = js.splitlines()
found_first_end = False
for i in range(len(lines)):
    if lines[i].strip() == "});":
        # Look ahead, if there is another "});" further down, delete this one
        if any(l.strip() == "});" for l in lines[i+1:]):
            lines[i] = ""
            break

with open("main.js", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
