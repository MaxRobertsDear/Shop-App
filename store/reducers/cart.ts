import { ADD_TO_CART, REMOVE_FROM_CART } from '../actions/cart'
import { ADD_ORDER } from '../actions/orders'
import CartItem from '../../models/cart-item'
import { DELETE_PRODUCT } from '../actions/products'
import { CartState, CartActionTypes } from './cart.d'

const initialSate: CartState = {
  items: [],
  totalAmount: 0,
}

export default (state = initialSate, action: CartActionTypes) => {
  switch (action.type) {
    case ADD_TO_CART:
      const addedProduct = action.product
      const prodPrice = addedProduct.price
      const prodTitle = addedProduct.title

      if (state.items[addedProduct.id]) {
        // already have that product in the items
        const updatedCartItem = new CartItem({
          quantity: state.items[addedProduct.id].quantity + 1,
          productPrice: prodPrice,
          productTitle: prodTitle,
          sum: state.items[addedProduct.id].sum + prodPrice,
        })
        return {
          ...state,
          items: { ...state.items, [addedProduct.id]: updatedCartItem },
          totalAmount: state.totalAmount + prodPrice,
        }
      } else {
        const newCartItem = new CartItem({
          quantity: 1,
          productPrice: prodPrice,
          productTitle: prodTitle,
          sum: prodPrice,
        })
        return {
          ...state,
          items: { ...state.items, [addedProduct.id]: newCartItem },
          totalAmount: state.totalAmount + prodPrice,
        }
      }
    case REMOVE_FROM_CART:
      const selectedCartItem = state.items[action.pid]
      const currentQty = selectedCartItem.quantity
      let updatedCartItems

      if (currentQty > 1) {
        const updatedCartItem = new CartItem({
          quantity: selectedCartItem.quantity - 1,
          productPrice: selectedCartItem.productPrice,
          productTitle: selectedCartItem.productTitle,
          sum: selectedCartItem.sum - selectedCartItem.productPrice,
        })
        updatedCartItems = { ...state.items, [action.pid]: updatedCartItem }
      } else {
        updatedCartItems = { ...state.items }
        delete updatedCartItems[action.pid]
      }
      return {
        ...state,
        items: updatedCartItems,
        totalAmount: state.totalAmount - selectedCartItem.productPrice,
      }
    case ADD_ORDER:
      return initialSate
    case DELETE_PRODUCT:
      if (!state.items[action.pid]) {
        return state
      }
      const updatedItems = { ...state.items }
      const itemTotal = state.items[action.pid].sum
      delete updatedItems[action.pid]
      return {
        ...state,
        items: updatedItems,
        totalAmount: state.totalAmount - itemTotal,
      }
    default:
      return state
  }
}
