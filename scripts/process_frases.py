import csv
import json
import os

with open('data/frases.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total phrases loaded: {len(rows)}")

processed = []
for r in rows:
    item = {
        "id": r["#"].strip(),
        "frase": r["Frase"].strip(),
        "marca": r["Marca"].strip() if r["Marca"] else "",
        "agencia": r["Agencia"].strip() if r["Agencia"] else "",
        "pais": r["País"].strip() if r["País"] else "",
        "ano": r["Año"].strip() if r["Año"] else "",
        "tipo": r["Tipo"].strip() if r["Tipo"] else "Publicidad",
        "tema": r["Tema"].strip() if r["Tema"] else "",
        "funcion": r["Función"].strip() if r["Función"] else "",
        "tono": r["Tono"].strip() if r["Tono"] else "",
        "flag": r["Flag"].strip() if r["Flag"] else "OK",
        "motivo_flag": r["Motivo del flag"].strip() if r["Motivo del flag"] else "",
        "comodin": True if (r["Comodín"] or "").strip().lower() in ["sí", "si"] else False,
        "premio_el_ojo": r["Premio El Ojo"].strip() if r["Premio El Ojo"] else ""
    }
    processed.append(item)

print(f"Processed {len(processed)} structured items.")
# Print distribution of temas
temas = {}
for p in processed:
    for t in [x.strip() for x in p["tema"].split(";") if x.strip()]:
        temas[t] = temas.get(t, 0) + 1
print("Temas count:", temas)

# Print distribution of funciones
funcs = {}
for p in processed:
    f = p["funcion"]
    funcs[f] = funcs.get(f, 0) + 1
print("Funciones count:", funcs)

# Save as JSON
with open('data/frases.json', 'w', encoding='utf-8') as f:
    json.dump(processed, f, ensure_ascii=False, indent=2)
print("Saved data/frases.json successfully.")
