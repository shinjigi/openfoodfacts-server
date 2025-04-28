const fs = require("fs");
const path = require("path");

const tagRegex = /([a-zA-Z0-9_:-]+_tags):/g;
const fileTagsMap = new Map();
const tagFilesMap = new Map();

const directoryPath =
  "/home/shinjigi/projects/_GH/openfoodfacts/fork-shinjigi-4pullrequest/docs/api/ref/";

// Elenco delle directory da ignorare
const ignoredDirs = new Set(["examples", "parameters"]); // , "parameters", "requestBodies", "responses", "schemas"]);

// Funzione ricorsiva per trovare tutti i file in una directory
function getAllFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      if (!ignoredDirs.has(file)) {
        files = files.concat(getAllFiles(filePath)); // Se è una cartella non ignorata, cerca dentro
      }
    } else {
      files.push(filePath); // Se è un file, lo aggiunge
    }
  });
  return files;
}

// Ottieni tutti i file (anche nelle sottodirectory)
const allFiles = getAllFiles(directoryPath);

allFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1];

    if (!fileTagsMap.has(filePath)) {
      fileTagsMap.set(filePath, new Set());
    }
    fileTagsMap.get(filePath).add(tag);

    if (!tagFilesMap.has(tag)) {
      tagFilesMap.set(tag, new Set());
    }
    tagFilesMap.get(tag).add(filePath);
  }
});

// Cerca duplicati tra file diversi
console.log("Tag duplicati in più file:");
tagFilesMap.forEach((files, tag) => {
  if (files.size > 1) {
    console.log(
      `Tag: ${tag} - Present in: ${Array.from(files)
        .map((a) =>
          (
            a.replace(
              /\/home\/shinjigi\/projects\/_GH\/openfoodfacts\/fork-shinjigi-4pullrequest\/docs\/api\/ref\//g,
              ""
            ) + "\t\t"
          ).substring(0, 40)
        )
        .join(",\t\t")}\n\n`
    );
  }
});
