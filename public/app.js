const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');
const body = document.querySelector('#products-body');
const dialog = document.querySelector('#product-dialog');
const form = document.querySelector('#product-form');
const errorBox = document.querySelector('#form-error');
const notice = document.querySelector('#notice');
let products = [];

document.querySelector('#today').textContent = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

function displayError(message) {
  notice.textContent = message;
  notice.hidden = false;
}

async function loadProducts() {
  notice.hidden = true;
  document.querySelector('#results-count').textContent = 'Carregando produtos...';
  try {
    const response = await fetch('/produtos');
    if (!response.ok) throw new Error(`A API respondeu com status ${response.status}.`);
    products = await response.json();
    if (!Array.isArray(products)) throw new Error('A resposta da API não contém uma lista de produtos.');
    renderProducts();
  } catch (error) {
    products = [];
    renderProducts();
    displayError(`Não foi possível carregar os produtos. ${error.message} Confira se a API está ativa e tente novamente.`);
    document.querySelector('#results-count').textContent = 'Falha ao carregar';
  }
}

function renderProducts() {
  const query = document.querySelector('#search').value.trim().toLocaleLowerCase('pt-BR');
  const visible = products.filter(product => `${product.nome || ''} ${product.descricao || ''}`.toLocaleLowerCase('pt-BR').includes(query));
  const units = products.reduce((sum, product) => sum + (Number(product.quantidade_estoque) || 0), 0);
  const inventory = products.reduce((sum, product) => sum + (Number(product.preco) || 0) * (Number(product.quantidade_estoque) || 0), 0);
  document.querySelector('#total-products').textContent = number.format(products.length);
  document.querySelector('#total-units').textContent = number.format(units);
  document.querySelector('#inventory-value').textContent = currency.format(inventory);
  document.querySelector('#sidebar-count').textContent = number.format(products.length);
  body.replaceChildren();
  for (const product of visible) {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const cell = document.createElement('div');
    cell.className = 'product-cell';
    const thumb = document.createElement('div');
    thumb.className = 'product-thumb';
    thumb.textContent = (product.nome || '?').trim().slice(0, 2);
    const text = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = product.nome || 'Produto sem nome';
    const description = document.createElement('div');
    description.className = 'product-description';
    description.textContent = product.descricao || 'Sem descrição';
    text.append(name, description);
    cell.append(thumb, text);
    nameCell.append(cell);
    const priceCell = document.createElement('td');
    priceCell.className = 'price';
    priceCell.textContent = currency.format(Number(product.preco) || 0);
    const stockCell = document.createElement('td');
    const stock = Number(product.quantidade_estoque) || 0;
    const badge = document.createElement('span');
    badge.className = `stock-badge${stock === 0 ? ' out' : stock <= 5 ? ' low' : ''}`;
    badge.textContent = stock === 0 ? 'Sem estoque' : `${number.format(stock)} un.`;
    stockCell.append(badge);
    const valueCell = document.createElement('td');
    valueCell.className = 'row-value';
    valueCell.textContent = currency.format((Number(product.preco) || 0) * stock);
    const idCell = document.createElement('td');
    idCell.className = 'row-id';
    idCell.textContent = product.id == null ? '' : `#${product.id}`;
    row.append(nameCell, priceCell, stockCell, valueCell, idCell);
    body.append(row);
  }
  const isEmpty = products.length === 0;
  document.querySelector('#empty-state').hidden = !isEmpty;
  document.querySelector('#no-results').hidden = isEmpty || visible.length > 0;
  document.querySelector('.table-scroll').hidden = isEmpty || visible.length === 0;
  document.querySelector('#results-count').textContent = `${number.format(visible.length)} ${visible.length === 1 ? 'produto' : 'produtos'}${query ? ' encontrados' : ''}`;
}

function openDialog() {
  form.reset();
  errorBox.hidden = true;
  dialog.showModal();
  form.elements.nome.focus();
}

document.querySelector('#new-product').addEventListener('click', openDialog);
document.querySelector('#empty-create').addEventListener('click', openDialog);
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#cancel-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#refresh').addEventListener('click', loadProducts);
document.querySelector('#search').addEventListener('input', renderProducts);

form.addEventListener('submit', async event => {
  event.preventDefault();
  errorBox.hidden = true;
  const values = new FormData(form);
  const payload = {
    nome: String(values.get('nome')).trim(),
    descricao: String(values.get('descricao')).trim(),
    preco: Number(values.get('preco')),
    quantidade_estoque: Number(values.get('quantidade_estoque'))
  };
  if (!payload.nome || !payload.descricao || !Number.isFinite(payload.preco) || payload.preco < 0 || !Number.isInteger(payload.quantidade_estoque) || payload.quantidade_estoque < 0) {
    errorBox.textContent = 'Informe nome, descrição, um preço válido e uma quantidade inteira igual ou maior que zero.';
    errorBox.hidden = false;
    return;
  }
  const save = document.querySelector('#save-product');
  save.disabled = true;
  save.textContent = 'Salvando...';
  try {
    const response = await fetch('/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `A API respondeu com status ${response.status}.`);
    dialog.close();
    await loadProducts();
  } catch (error) {
    errorBox.textContent = `Não foi possível salvar o produto. ${error.message}`;
    errorBox.hidden = false;
  } finally {
    save.disabled = false;
    save.textContent = 'Salvar produto';
  }
});

loadProducts();
