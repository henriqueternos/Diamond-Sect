import { auth, onAuthStateChanged, isAdmin, writePath } from "./firebase.js";

const fileInput = document.getElementById("import_file");
const textArea = document.getElementById("import_text");
const runBtn = document.getElementById("import_run");
const noticeEl = document.getElementById("importNotice");
const logEl = document.getElementById("importLog");

if(fileInput){
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if(!file) return;
    textArea.value = await file.text();
  });
}

function notice(text, error = false){
  if(noticeEl) noticeEl.innerHTML = `<div class="notice ${error ? "error" : ""}">${text}</div>`;
}

function log(line){
  if(logEl) logEl.textContent += line + "\n";
}

function countKeys(obj){
  return obj ? Object.keys(obj).length : 0;
}

async function importAll(json){
  logEl.textContent = "";

  // Aceita tanto o formato aninhado antigo (products.products.items)
  // quanto um formato já achatado (products.items ou items direto)
  const productsRoot = json.products || {};
  const products =
    productsRoot.products?.items ||
    productsRoot.items ||
    json.items ||
    {};

  const heroes =
    productsRoot.siteContent?.heroes ||
    json.siteContent?.heroes ||
    {};

  const orders = json.orders || {};
  const payments = json.payments || {};
  const users = json.users || {};

  const total =
    countKeys(products) + (countKeys(heroes) ? 1 : 0) +
    countKeys(orders) + countKeys(payments) + countKeys(users);

  if(total === 0){
    notice("Não encontrei nenhum dado reconhecível nesse JSON. Confira o formato.", true);
    return;
  }

  notice(`Importando ${total} registro(s)...`);
  let done = 0;

  for(const [id, product] of Object.entries(products)){
    await writePath(`products/products/items/${id}`, product);
    done++;
    log(`✔ produto: ${id}`);
  }

  if(countKeys(heroes)){
    await writePath("products/siteContent/heroes", heroes);
    log("✔ heroes do site");
  }

  for(const [id, order] of Object.entries(orders)){
    await writePath(`orders/${id}`, order);
    done++;
    log(`✔ pedido: ${id}`);
  }

  for(const [id, payment] of Object.entries(payments)){
    await writePath(`payments/${id}`, payment);
    done++;
    log(`✔ pagamento: ${id}`);
  }

  for(const [id, user] of Object.entries(users)){
    await writePath(`users/${id}`, user);
    done++;
    log(`✔ usuário: ${id}`);
  }

  notice(`Importação concluída: ${done} registro(s) gravado(s) no Firestore.`);
}

runBtn?.addEventListener("click", async () => {
  const raw = textArea.value.trim();
  if(!raw){
    notice("Cole o JSON ou selecione um arquivo antes de importar.", true);
    return;
  }
  let json;
  try{
    json = JSON.parse(raw);
  }catch(e){
    notice(`JSON inválido: ${e.message}`, true);
    return;
  }
  runBtn.disabled = true;
  try{
    await importAll(json);
  }catch(e){
    notice(`Erro durante a importação: ${e.message}`, true);
  }finally{
    runBtn.disabled = false;
  }
});

// Só libera a aba de importação para o admin (mesma checagem das outras abas)
onAuthStateChanged(auth, user => {
  const importTab = document.querySelector('[data-tab="import"]');
  if(!importTab) return;
  const allowed = !!user && isAdmin(user);
  importTab.classList.toggle("hidden", !allowed);
});
