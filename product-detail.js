const products = window.SPARKLE_PRODUCTS || [];
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id")) || 1;
const product = products.find(p => Number(p.id) === productId) || products[0];
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => "₹" + Number(n || 0).toLocaleString("en-IN");
let quantity = 1;
let galleryIndex = 0;
let toastTimer;
const images = product && product.image ? [product.image] : [];

function iconFor(p){return p.category==="Rings"?"fa-ring":p.category==="Necklaces"||p.category==="Mangalsutra"?"fa-heart":p.category==="Earrings"?"fa-gem":"fa-gem"}
function stars(rating){const n=Math.max(0,Math.min(5,Math.round(Number(rating)||0)));return "★".repeat(n)+"☆".repeat(5-n)}
function placeholder(p){return `<div class="main-image-placeholder"><i class="fa-solid ${iconFor(p)}"></i><span>Product image URL is not available</span></div>`}
function toast(msg){const el=$("#detailToast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
function renderGallery(){
  const main=$("#mainProductImage");
  const old=main.querySelector("img,.main-image-placeholder");if(old)old.remove();
  if(product.image){
    const img=document.createElement("img");img.src=product.image;img.alt=product.name;img.onerror=()=>{img.remove();main.insertAdjacentHTML("afterbegin",placeholder(product))};main.insertAdjacentElement("afterbegin",img);
    $("#thumbColumn").innerHTML=`<button class="product-thumb active" data-image="0"><img src="${product.image}" alt="${product.name}"></button>`;
  } else {
    main.insertAdjacentHTML("afterbegin",placeholder(product));
    $("#thumbColumn").innerHTML=Array.from({length:4},(_,i)=>`<button class="product-thumb ${i===0?"active":""}" data-image="${i}"><div class="thumb-placeholder"><i class="fa-solid ${iconFor(product)}"></i></div></button>`).join("");
  }
}
function setProductDetails(){
  document.title=`${product.name} | Sparkle Jewellery`;
  $("#crumbCategory").textContent=product.category;$("#crumbName").textContent=product.name;
  $("#productName").textContent=product.name;$("#detailBadge").textContent=product.badge||"Sparkle Collection";
  $("#productStars").textContent=stars(product.rating);$("#productRating").textContent=Number(product.rating||0).toFixed(1);
  $("#reviewCount").textContent=`(${product.reviews||0} reviews)`;$("#tabReviews").textContent=product.reviews||0;
  $("#productPrice").textContent=money(product.price);
  if(product.oldPrice && Number(product.oldPrice)>Number(product.price)){
    $("#originalPrice").textContent=money(product.oldPrice);
    $("#detailDiscount").textContent=`${Math.round((1-product.price/product.oldPrice)*100)}% OFF`;
  }else{$("#originalPrice").textContent="";$("#detailDiscount").textContent=""}
  $("#productDescription").textContent=product.description||`Discover the ${product.name}, selected for its beautiful design and timeless appeal.`;
  $("#longDescription").textContent=product.description||`The ${product.name} is a versatile jewellery piece designed to bring an elegant touch to your collection.`;
  $("#informationText").textContent=product.description||product.name;
  $("#specCategory").textContent=product.category;$("#specCollection").textContent=product.featured?"Featured":"Sparkle Collection";
  $("#infoCategory").textContent=product.category;$("#infoId").textContent=product.id;$("#infoPrice").textContent=money(product.price);
  $("#reviewAverage").textContent=Number(product.rating||0).toFixed(1);
  $("#reviewMessage").textContent=product.reviews ? `${product.reviews} review(s) are associated with this product listing.` : "No customer reviews have been added to this product yet.";
  renderGallery();
  renderRecommendations();
}
function renderRecommendations(){
  const others=products.filter(p=>p.id!==product.id).sort((a,b)=>{
    const ac=a.category===product.category?1:0,bc=b.category===product.category?1:0;
    if(ac!==bc)return bc-ac;
    return Number(b.featured)-Number(a.featured);
  }).slice(0,4);
  $("#recommendGrid").innerHTML=others.map(p=>`
    <article class="recommend-card">
      <a class="recommend-image" href="product.html?id=${p.id}">
        ${p.image?`<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`:""}
        <span class="recommend-placeholder" ${p.image?'style="display:none"':""}><i class="fa-solid ${iconFor(p)}"></i></span>
        <span class="recommend-heart"><i class="fa-regular fa-heart"></i></span>
      </a>
      <div class="recommend-info"><h3 title="${p.name}"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="recommend-price">${money(p.price)} ${p.oldPrice&&p.oldPrice>p.price?`<del>${money(p.oldPrice)}</del>`:""}</div>
        <div class="recommend-rating">${stars(p.rating)} <span style="color:#554b48">${Number(p.rating||0).toFixed(1)}</span></div>
        <button class="recommend-add" data-recommend-add="${p.id}"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>
      </div>
    </article>`).join("");
}
function changeQuantity(delta){quantity=Math.max(1,Math.min(20,quantity+delta));$("#quantity").textContent=quantity}
$("#qtyMinus").addEventListener("click",()=>changeQuantity(-1));
$("#qtyPlus").addEventListener("click",()=>changeQuantity(1));
function wishlist(){const b=$("#detailWishlist");b.classList.toggle("liked");b.innerHTML=`<i class="${b.classList.contains("liked")?"fa-solid":"fa-regular"} fa-heart"></i>`;$("#detailWishlistText").innerHTML=`<i class="${b.classList.contains("liked")?"fa-solid":"fa-regular"} fa-heart"></i> ${b.classList.contains("liked")?"Added to Wishlist":"Add to Wishlist"}`;toast(b.classList.contains("liked")?"Added to wishlist":"Removed from wishlist")}
$("#detailWishlist").addEventListener("click",wishlist);
$("#detailWishlistText").addEventListener("click",wishlist);
$("#addToCart").addEventListener("click",()=>toast(`${quantity} × ${product.name} added to cart`));
$("#buyNow").addEventListener("click",()=>toast(`Ready to buy ${quantity} × ${product.name}. Checkout can be connected later.`));
$("#sizeGuide").addEventListener("click",()=>$("#sizeModal").classList.add("open"));
$("#closeSizeModal").addEventListener("click",()=>$("#sizeModal").classList.remove("open"));
$("#okSize").addEventListener("click",()=>$("#sizeModal").classList.remove("open"));
$("#sizeModal").addEventListener("click",e=>{if(e.target.id==="sizeModal")e.currentTarget.classList.remove("open")});
$("#recommendGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-recommend-add]");if(btn)toast(`Added ${products.find(p=>p.id===Number(btn.dataset.recommendAdd)).name} to cart`)});
$$(".tab-button").forEach(btn=>btn.addEventListener("click",()=>{
  $$(".tab-button").forEach(b=>b.classList.toggle("active",b===btn));
  $$(".tab-panel").forEach(panel=>panel.classList.toggle("active",panel.id===`tab-${btn.dataset.tab}`));
}));
$("#thumbColumn").addEventListener("click",e=>{const b=e.target.closest("[data-image]");if(!b)return;galleryIndex=Number(b.dataset.image);$$(".product-thumb").forEach(t=>t.classList.toggle("active",t===b));if(product.image){const img=$("#mainProductImage img");if(img)img.src=product.image}});
$("#prevImage").addEventListener("click",()=>{galleryIndex=Math.max(0,galleryIndex-1);toast("Only the provided product image is available in the data")});
$("#nextImage").addEventListener("click",()=>toast("Add extra image URLs to enable a multi-image gallery"));
$("#mobileMenu").addEventListener("click",()=>$("#navLinks").classList.toggle("open"));
$("#detailSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.trim();window.location.href=`index.html${q?"?search="+encodeURIComponent(q):""}`}});
setProductDetails();
