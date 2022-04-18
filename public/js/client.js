// -------------------- RENDER ON THE CLIENT SIDE - STATICALLY SERVED --------------------
// Event emitter - Button
const deleteProduct = (btn) => {
  //   ------------ EXTRACT INFORMATION WE NEED FOR THE REQUEST -------------
  // elements around the button within the parent Node
  // attribute selector
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;

  // reference to the article based on the button
  // * closets (ancestor) element with that selector
  const productElement = btn.closest("article");

  // * SEND A ASYNCHRONOUS REQUEST TO THE SERVER AND WORK WITH THE RESPONSE
  /* fetch method => supported by browser for sending http requests
    Args: 
    1. => if no schema (http://) is specified : send send to localhost 
    2. => configuration object such as req.body, method, keepAlive, credentials ...

    */
  fetch(`/admin/product/${productId}`, {
    method: "DELETE",
    headers: {
      // encode csrf token
      "csrf-token": csrfToken,
    },
  })
    .then((result) => {
      // return new promise
      return result.json();
    })
    // response body = data
    .then((data) => {
      // successful deleted the product from the database - so we can delete it in the front-end
      // * remove() works for every browser except internet explorer
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => console.log(err));
};
