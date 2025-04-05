let products = []
const getProductById =async ()=>{
    const response = await fetch("/all-products");

    const result = await response.json();
    products = result
    console.log(products)
}
getProductById()
const AddtoCart = (id) => {
    let product = products.filter((x) => x.productId == id)[0];
    console.log(product,id)
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    
    let existingProductIndex = cartItems.findIndex((x) => x.productId == id);
    
    if (existingProductIndex !== -1) {
        cartItems[existingProductIndex].quantity += 1;
    } else {
        product = { ...product, quantity: 1 };
        cartItems.push(product);
    }
    localStorage.setItem("cart", JSON.stringify(cartItems));

    console.log("Cart Updated:", cartItems);
    showCartItems()
    ToggleCart()
};
const DeleteCartItem = (id) => {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || []; // Get the cart

    // Filter out the product with the given id
    cartItems = cartItems.filter(item => item.productId !== id);

    // Update localStorage with the new cart
    localStorage.setItem("cart", JSON.stringify(cartItems));

    console.log("Item deleted. Updated Cart:", cartItems); // Debugging log
    showCartItems()

};

const showCartItems = () => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartitemdiv = document.querySelector(".cartPopup .cart-items")
    const checkproducts = document.querySelector(".checkoutProducts .products-container")
    const cartTotal = document.querySelector(".cartPopup .checkoutbutton h2 span")
    const checkoutTotal = document.querySelector(".checkoutProducts .checkoutTotal h2 span")
    const template = document.createElement("template")
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity , 0);


    let totalPrice = 0
    if (!checkproducts) {
        cartitemdiv.innerHTML = ""
        cartItems.map((element) => {
            totalPrice += element.price
            template.innerHTML = `
            <div class="cart-item item-${element.productId}">
                <button class="delete" onclick="DeleteCartItem(${element.productId})">X</button>
                <img src="${element.img}" alt="" class="thumbnail">
                <div class="details">
                    <h2 class="name">${element.title}</h2>
                    <p class="price quantityText">x${element.quantity}</p>
                    <div class="quantity">
                <button onclick="quantity('add', ${element.productId})">+</button>
                <button onclick="quantity('subt', ${element.productId})">-</button>
                </div>
                    <p class="price quantityPrice">$${(element.price * element.quantity).toFixed(2)}</p>
                </div>
            </div>`
            cartitemdiv.appendChild(template.content.firstElementChild)
        })
        cartTotal.innerHTML = `$${total.toFixed(2)}`
    } else {
     
        cartItems.innerHTML = ""
        cartItems.map((element) => {
            template.innerHTML = `
        <div class="product">
                <div class="img">
                    <div></div>
                    <img src="${element.img}" alt="">
                </div>
                <h3>${element.subtitle}</h3>
                <p class="paragraph">
                    x${element.quantity}   
                </p>
                
                <p class="paragraph">
                    $${(element.price * element.quantity).toFixed(2)}   
                </p>
            </div>
        `
            checkproducts.appendChild(template.content.firstElementChild)
        })
        checkoutTotal.innerHTML = `$${total.toFixed(2)}`
    }

}
const quantity = (opr,productId)=>{ 
    const cartTotal = document.querySelector(".cartPopup .checkoutbutton h2 span")
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const product = cartItems.filter(x=>x.productId == productId)[0]
    const quantitytext = document.querySelector(`.item-${productId} .quantityText`)
    const quantityPrice =document.querySelector(`.item-${productId} .quantityPrice`)
    
    let quantityNumber = product.quantity
    if(opr == "add"){
        quantityNumber += 1
    }else if(opr == "subt" && quantityNumber >=2){
        quantityNumber -= 1
    }
    
    quantitytext.innerHTML = `x${quantityNumber}`
    quantityPrice.innerHTML = `$${((product.price * quantityNumber).toFixed(2))}`
    let existingProductIndex = cartItems.findIndex((x) => x.productId == productId);
    cartItems[existingProductIndex].quantity = quantityNumber;
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity , 0);
    cartTotal.innerHTML = `$${(total).toFixed(2)}`
}


const ToggleCart = () => {
    const cart = document.querySelector(".cartPopup")
    cart.classList.toggle("active")
}
const placeOrder = (e) => {
    e.preventDefault();

    const checkoutForm = document.querySelector(".right.checkout");
    const orderSuccessPopup = document.querySelector(".successfullOrder");

    // Get form values correctly
    const name = document.querySelector("input[name='name']").value;
    const phone = document.querySelector("input[name='phone']").value;
    const email = document.querySelector("input[name='email']").value;
    const city = document.querySelector("input[name='city']").value;
    const state = document.querySelector("input[name='state']").value;
    const address = document.querySelector("input[name='address']").value;
    const zipcode = document.querySelector("input[name='zipcode']").value;
    const tracking = document.querySelector(".trackingid span");
    const totalOrder = document.querySelector(".total span");

    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity , 0);
    const Data = {
        name, phone, email, city, state, address, zipcode, cartItems, total: total.toFixed(2), orderStatus: "Processing"
    };

    if (cartItems.length == 0) return alert("Please Add Items to cart First!")
    if (name == "" || phone == "" || email == "" || city == "" || state == "" || address == "" || zipcode == "") return alert("Please Fill all the required details first")
    fetch("/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(Data)
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data)
            tracking.innerHTML = `${data.data} <i onclick="copytracking(${data.data})" class="fa-solid fa-copy"></i>`
            totalOrder.innerHTML = `$${total}`
            orderSuccessPopup.classList.toggle("active");
            localStorage.removeItem("cart")
        })
        .catch(error => console.error("Error:", error));
};
