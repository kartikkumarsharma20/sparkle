// Sparkle Jewellery shop page
// IMAGE LINKS: For each product below, replace image: "" with image: "YOUR_IMAGE_URL".
// Leave it as "" until you have the image link; a soft placeholder will appear instead.

const products = window.SPARKLE_PRODUCTS;

;

const state = { page: 1, perPage: 8, cart: 0, wishlist: new Set(), modalProduct: null };
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => "₹" + n.toLocaleString("en-IN");
const grid = $("#productGrid");
const toast = $("#toast");
let toastTimer;

function showToast(message){
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.classList.remove("show"),2300);
}
function selectedValues(selector){return $$(selector).filter(el=>el.checked).map(el=>el.value)}
function getFilteredProducts(){
  const query = $("#searchInput").value.trim().toLowerCase();
  const categories = selectedValues(".category-filter");
  const materials = selectedValues(".material-filter");
  const ratings = selectedValues(".rating-filter").map(Number);
  const maxPrice = Number($("#priceRange").value);
  let list = products.filter(p =>
    (!query || `${p.name} ${p.category} ${p.material}`.toLowerCase().includes(query)) &&
    (!categories.length || categories.includes(p.category)) &&
    (!materials.length || materials.includes(p.material)) &&
    p.price <= maxPrice &&
    (!ratings.length || ratings.some(r => p.rating >= r))
  );
  const sort = $("#sortSelect").value;
  if(sort==="price-low") list.sort((a,b)=>a.price-b.price);
  if(sort==="price-high") list.sort((a,b)=>b.price-a.price);
  if(sort==="rating") list.sort((a,b)=>b.rating-a.rating);
  if(sort==="newest") list.sort((a,b)=>b.id-a.id);
  if(sort==="popular") list.sort((a,b)=>a.rank-b.rank);
  return list;
}
function productImage(p, modal=false){
  const content = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-placeholder');this.parentElement.innerHTML='<div class=\'placeholder-content\'><i class=\'fa-solid fa-gem\'></i><span>IMAGE NOT AVAILABLE</span></div>'">`
    : `<div class="placeholder-content"><i class="fa-solid ${p.icon}"></i><span>${p.name}<br><small>Image link not available in spreadsheet</small></span></div>`;
  return p.sourceLink
    ? `<a class="product-image-link" href="${p.sourceLink}" target="_blank" rel="noopener noreferrer" aria-label="Open ${p.name} product page">${content}</a>`
    : content;
}
function stars(rating){
  const full = Math.round(rating);
  return `<span class="stars">${"★".repeat(full)}${"☆".repeat(5-full)}</span>`;
}
function renderProducts(){
  const filtered = getFilteredProducts();
  const pages = Math.max(1,Math.ceil(filtered.length/state.perPage));
  if(state.page>pages) state.page=pages;
  const start = (state.page-1)*state.perPage;
  const visible = filtered.slice(start,start+state.perPage);
  grid.innerHTML = visible.map(p=>`
    <article class="product-card">
      <div class="product-visual ${p.image ? "" : "image-placeholder"}">
        <a class="product-image-link" href="product.html?id=${p.id}" aria-label="View ${p.name}">
          ${productImage(p)}
        </a>
        <span class="product-badge">${p.badge}</span>
        <button class="heart-btn ${state.wishlist.has(p.id)?"liked":""}" data-wishlist="${p.id}" aria-label="Add ${p.name} to wishlist"><i class="${state.wishlist.has(p.id)?"fa-solid":"fa-regular"} fa-heart"></i></button>
      </div>
      <div class="product-info">
        <h3 class="product-title" title="${p.name}">${p.sourceLink ? `<a href="${p.sourceLink}" target="_blank" rel="noopener noreferrer">${p.name} <i class="fa-solid fa-arrow-up-right-from-square product-link-icon"></i></a>` : p.name}</h3>
        <p class="product-category">${p.category}</p>
        <div class="product-rating">${stars(p.rating)} <span class="rating-number">${p.rating.toFixed(1)} (${p.reviews})</span></div>
        <div class="price-row"><span class="current-price">${money(p.price)}</span>${p.oldPrice && p.oldPrice > p.price ? `<span class="old-price">${money(p.oldPrice)}</span><span class="discount">${Math.round((1-p.price/p.oldPrice)*100)}% OFF</span>` : ""}</div>
        <div class="product-actions"><button class="add-btn" data-add="${p.id}"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button><button class="quick-btn" data-quick="${p.id}"><i class="fa-regular fa-heart"></i> Quick View</button></div>
      </div>
    </article>`).join("");
  $("#resultCount").textContent = filtered.length ? `Showing ${start+1}–${Math.min(start+state.perPage,filtered.length)} of ${filtered.length} products` : "Showing 0 products";
  $("#emptyState").hidden = filtered.length!==0;
  grid.hidden = filtered.length===0;
  renderPagination(pages);
  renderChips();
}
function renderPagination(pages){
  const el=$("#pagination");
  let html=`<button data-page="${state.page-1}" ${state.page===1?"disabled":""} aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>`;
  for(let i=1;i<=pages;i++) html+=`<button data-page="${i}" class="${state.page===i?"active":""}">${i}</button>`;
  html+=`<button data-page="${state.page+1}" ${state.page===pages?"disabled":""} aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button>`;
  el.innerHTML=html;
}
function renderChips(){
  const vals = [
    ...selectedValues(".category-filter"),
    ...selectedValues(".material-filter"),
    ...selectedValues(".rating-filter").map(v=>`${v}+ stars`),
    ...(Number($("#priceRange").value)<3500000?[`Up to ${money(Number($("#priceRange").value))}`]:[])
  ];
  $("#activeFilters").innerHTML=vals.map(v=>`<span class="filter-chip">${v}<button data-remove="${v}" aria-label="Remove ${v}">×</button></span>`).join("");
  $("#maxPriceLabel").textContent=money(Number($("#priceRange").value));
}
function updateCounts(){
  $("#cartCount").textContent=state.cart;
  $("#wishlistCount").textContent=state.wishlist.size;
}
function resetPage(){state.page=1;renderProducts()}
function clearFilters(){
  $$(".category-filter,.material-filter,.rating-filter").forEach(el=>el.checked=false);
  $("#priceRange").value=3500000;$("#searchInput").value="";$("#sortSelect").value="popular";resetPage();
}
function addToCart(id){
  const p=products.find(item=>item.id===Number(id));state.cart++;updateCounts();showToast(`${p.name} added to cart`);
}
function toggleWishlist(id){
  id=Number(id);
  if(state.wishlist.has(id)){state.wishlist.delete(id);showToast("Removed from wishlist")}
  else{state.wishlist.add(id);showToast("Added to wishlist")}
  updateCounts();renderProducts();
}
function openQuickView(id){
  const p=products.find(item=>item.id===Number(id));state.modalProduct=p;
  const holder=$("#modalImage");holder.className=`modal-image ${p.image?"":"image-placeholder"}`;holder.innerHTML=productImage(p,true);
  $("#modalTitle").textContent=p.name;$("#modalCategory").textContent=p.category;
  $(".modal-description").textContent = p.description || "A beautiful jewellery piece from our collection.";
  $("#modalRating").innerHTML=`${stars(p.rating)} <span style="color:#5b504d">${p.rating.toFixed(1)} (${p.reviews} reviews)</span>`;
  $("#modalPrice").innerHTML=`${money(p.price)} ${p.oldPrice && p.oldPrice > p.price ? `<del>${money(p.oldPrice)}</del>` : ""}`;
  $("#quickViewModal").classList.add("open");
}
grid.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]"), heart=e.target.closest("[data-wishlist]"), quick=e.target.closest("[data-quick]");
  if(add)addToCart(add.dataset.add);
  if(heart)toggleWishlist(heart.dataset.wishlist);
  if(quick)openQuickView(quick.dataset.quick);
});
$("#pagination").addEventListener("click",e=>{
  const btn=e.target.closest("[data-page]");if(!btn||btn.disabled)return;
  state.page=Number(btn.dataset.page);renderProducts();window.scrollTo({top:$("#productsArea")?.offsetTop||220,behavior:"smooth"});
});
$("#activeFilters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-remove]");if(!btn)return;const val=btn.dataset.remove;
  $$(".category-filter,.material-filter,.rating-filter").forEach(el=>{if(el.value===val || `${el.value}+ stars`===val)el.checked=false});
  if(val.startsWith("Up to ₹"))$("#priceRange").value=3500000;
  resetPage();
});
$$(".category-filter,.material-filter,.rating-filter").forEach(el=>el.addEventListener("change",resetPage));
$("#priceRange").addEventListener("input",resetPage);
$("#searchInput").addEventListener("input",resetPage);
$("#sortSelect").addEventListener("change",resetPage);
$("#clearFilters").addEventListener("click",clearFilters);
$("#emptyClear").addEventListener("click",clearFilters);
$("#gridView").addEventListener("click",()=>{grid.classList.remove("list-mode");$("#gridView").classList.add("active");$("#listView").classList.remove("active")});
$("#listView").addEventListener("click",()=>{grid.classList.add("list-mode");$("#listView").classList.add("active");$("#gridView").classList.remove("active")});
$("#closeModal").addEventListener("click",()=>$("#quickViewModal").classList.remove("open"));
$("#quickViewModal").addEventListener("click",e=>{if(e.target.id==="quickViewModal")e.currentTarget.classList.remove("open")});
$("#modalAdd").addEventListener("click",()=>{if(state.modalProduct)addToCart(state.modalProduct.id);$("#quickViewModal").classList.remove("open")});
$("#cartButton").addEventListener("click",()=>showToast(`Your cart has ${state.cart} item${state.cart===1?"":"s"}`));
$("#mobileMenu").addEventListener("click",()=>$("#navLinks").classList.toggle("open"));
$$(".filter-heading").forEach(btn=>btn.addEventListener("click",()=>{
  const content=$("#"+btn.dataset.toggle);content.classList.toggle("hidden");btn.classList.toggle("collapsed");
}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#quickViewModal").classList.remove("open")});

renderProducts();updateCounts();

// Open the full product details when a product card is clicked (excluding buttons/links).
grid.addEventListener("click", e => {
  if (e.target.closest("button, a, input")) return;
  const card = e.target.closest(".product-card");
  if (card) {
    const quick = card.querySelector("[data-quick]");
    if (quick) window.location.href = `product.html?id=${quick.dataset.quick}`;
  }
});

const incomingSearch = new URLSearchParams(window.location.search).get("search");
if (incomingSearch) { $("#searchInput").value = incomingSearch; renderProducts(); }
