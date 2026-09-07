/* global JSZip */

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const QUALITY_WIDTHS = { small: 480, medium: 960, large: 1600 };

const form = document.querySelector("#search-form");
const keywordInput = document.querySelector("#keyword");
const countInput = document.querySelector("#image-count");
const qualityInput = document.querySelector("#quality");
const searchButton = document.querySelector("#search-button");
const downloadButton = document.querySelector("#download-button");
const selectAll = document.querySelector("#select-all");
const selectAllLabel = document.querySelector("#select-all-label");
const imageGrid = document.querySelector("#image-grid");
const emptyState = document.querySelector("#empty-state");
const status = document.querySelector("#status");
const resultsTitle = document.querySelector("#results-title");
const resultsKicker = document.querySelector("#results-kicker");
const cardTemplate = document.querySelector("#card-template");

let images = [];
let activeSearch = null;
let searchVersion = 0;

function setStatus(message, type = "") {
  status.textContent = message;
  status.className = `status${type ? ` is-${type}` : ""}`;
}

function humanTitle(title) {
  return title.replace(/^File:/i, "").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/_/g, " ");
}

function normalizeFileName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "images";
}

function extensionFor(image) {
  const byMime = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/tiff": "tif" };
  const fromUrl = image.downloadUrl.split("?")[0].match(/\.([a-z0-9]{2,5})$/i)?.[1];
  return fromUrl || byMime[image.mime] || "jpg";
}

function selectedImages() {
  const chosen = new Set([...imageGrid.querySelectorAll(".image-checkbox:checked")].map((input) => input.dataset.id));
  return images.filter((image) => chosen.has(String(image.id)));
}

function updateSelectionUi() {
  const selected = selectedImages().length;
  const total = images.length;
  downloadButton.disabled = selected === 0;
  downloadButton.querySelector("span").textContent = selected ? `Télécharger ${selected} image${selected > 1 ? "s" : ""} en ZIP` : "Télécharger la sélection en ZIP";
  selectAll.checked = total > 0 && selected === total;
  selectAll.indeterminate = selected > 0 && selected < total;
}

function clearResults() {
  images = [];
  imageGrid.replaceChildren();
  emptyState.hidden = false;
  selectAllLabel.hidden = true;
  updateSelectionUi();
}

function renderResults() {
  const fragment = document.createDocumentFragment();
  images.forEach((image, index) => {
    const card = cardTemplate.content.cloneNode(true);
    const checkbox = card.querySelector(".image-checkbox");
    const img = card.querySelector(".result-image");
    const caption = card.querySelector(".image-caption");
    const article = card.querySelector(".image-card");

    checkbox.dataset.id = image.id;
    checkbox.addEventListener("change", updateSelectionUi);
    img.src = image.previewUrl;
    img.alt = humanTitle(image.title);
    img.addEventListener("error", () => {
      images = images.filter((candidate) => candidate.id !== image.id);
      article.remove();
      updateSelectionUi();
    }, { once: true });
    caption.textContent = humanTitle(image.title);
    article.style.animationDelay = `${Math.min(index * 25, 250)}ms`;
    fragment.append(card);
  });
  imageGrid.replaceChildren(fragment);
  emptyState.hidden = true;
  selectAllLabel.hidden = false;
  updateSelectionUi();
}

async function searchImages(keyword, requestedCount, quality) {
  activeSearch?.abort();
  activeSearch = new AbortController();
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: keyword,
    gsrnamespace: "6",
    gsrsort: "relevance",
    gsrlimit: String(Math.min(Math.max(requestedCount * 3, 30), 50)),
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: String(QUALITY_WIDTHS[quality]),
  });

  const response = await fetch(`${COMMONS_API}?${params.toString()}`, { signal: activeSearch.signal });
  if (!response.ok) throw new Error("Le service d’images est momentanément indisponible.");
  const data = await response.json();
  const pages = Object.values(data.query?.pages || {});

  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      return {
        id: page.pageid,
        title: page.title,
        mime: info.mime,
        previewUrl: info.thumburl || info.url,
        downloadUrl: info.thumburl || info.url,
      };
    })
    .filter((image) => image && image.mime?.startsWith("image/") && image.mime !== "image/svg+xml")
    .slice(0, requestedCount);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const keyword = keywordInput.value.trim();
  if (!keyword) return;

  const currentSearch = ++searchVersion;
  const requestedCount = Number(countInput.value);
  searchButton.disabled = true;
  searchButton.querySelector("span").textContent = "Recherche…";
  clearResults();
  resultsKicker.textContent = "RECHERCHE EN COURS";
  resultsTitle.textContent = `Recherche : « ${keyword} »`;
  setStatus("Recherche d’images sur Wikimedia Commons…", "progress");

  try {
    const results = await searchImages(keyword, requestedCount, qualityInput.value);
    if (currentSearch !== searchVersion) return;
    images = results;
    if (!images.length) {
      resultsKicker.textContent = "AUCUN RÉSULTAT";
      resultsTitle.textContent = "Aucune image exploitable trouvée";
      setStatus("Essayez un autre mot-clé, éventuellement en anglais.", "error");
      return;
    }
    renderResults();
    resultsKicker.textContent = `${images.length} RÉSULTAT${images.length > 1 ? "S" : ""}`;
    resultsTitle.textContent = `Images pour « ${keyword} »`;
    setStatus(`${images.length} image${images.length > 1 ? "s" : ""} sélectionnée${images.length > 1 ? "s" : ""} par défaut. Décochez celles que vous ne souhaitez pas conserver.`);
  } catch (error) {
    if (error.name === "AbortError") return;
    if (currentSearch !== searchVersion) return;
    resultsKicker.textContent = "ERREUR DE RECHERCHE";
    resultsTitle.textContent = "Les images ne sont pas disponibles";
    setStatus(error.message || "Impossible de récupérer les images. Vérifiez votre connexion puis réessayez.", "error");
  } finally {
    if (currentSearch === searchVersion) {
      searchButton.disabled = false;
      searchButton.querySelector("span").textContent = "Rechercher";
    }
  }
});

selectAll.addEventListener("change", () => {
  imageGrid.querySelectorAll(".image-checkbox").forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
  });
  updateSelectionUi();
});

async function fetchImageBlob(image) {
  const response = await fetch(image.downloadUrl, { mode: "cors" });
  if (!response.ok) throw new Error(`Échec du téléchargement : ${image.title}`);
  return response.blob();
}

downloadButton.addEventListener("click", async () => {
  const chosen = selectedImages();
  if (!chosen.length || !window.JSZip) {
    setStatus("La bibliothèque ZIP n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.", "error");
    return;
  }

  const keyword = keywordInput.value.trim();
  const archiveName = `${normalizeFileName(keyword)}-images.zip`;
  const zip = new JSZip();
  downloadButton.disabled = true;
  let completed = 0;
  let skipped = 0;
  const usedNames = new Set();

  try {
    for (const image of chosen) {
      setStatus(`Préparation de l’image ${completed + 1} sur ${chosen.length}…`, "progress");
      try {
        const blob = await fetchImageBlob(image);
        const baseName = normalizeFileName(humanTitle(image.title)).slice(0, 85) || "image";
        const extension = extensionFor(image);
        let filename = `${baseName}.${extension}`;
        let duplicate = 2;
        while (usedNames.has(filename)) filename = `${baseName}-${duplicate++}.${extension}`;
        usedNames.add(filename);
        zip.file(filename, blob);
        completed++;
      } catch {
        skipped++;
      }
    }

    if (!completed) throw new Error("Aucune image n’a pu être ajoutée au ZIP. Réessayez dans quelques instants.");
    setStatus("Compression du fichier ZIP…", "progress");
    const archive = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (metadata) => {
      setStatus(`Compression du fichier ZIP… ${Math.round(metadata.percent)} %`, "progress");
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(archive);
    link.download = archiveName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    setStatus(`${archiveName} a été téléchargé avec ${completed} image${completed > 1 ? "s" : ""}${skipped ? ` (${skipped} ignorée${skipped > 1 ? "s" : ""})` : ""}.`);
  } catch (error) {
    setStatus(error.message || "Impossible de créer le fichier ZIP.", "error");
  } finally {
    updateSelectionUi();
  }
});
