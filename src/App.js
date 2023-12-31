// App.js

import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function App() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);


    const fetchDataFromBackend = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataFromBackend();
    }, []);

    const handleAddToCart = (product) => {
        // Logic to add the product to the cart
        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(item => item.product_id === product.product_id);

            if (existingItemIndex !== -1) {
                // If the item already exists in the cart, update its count
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], count: updatedItems[existingItemIndex].count + 1 };
                return updatedItems;
            } else {
                // If the item is not in the cart, add it with count 1
                return [...prevItems, { ...product, count: 1 }];
            }
        });
    };

    const handleBuy = () => {
        // Logic to handle buying (send products to the backend)
        const orderItems = cartItems.map(item => ({
            product_id: item.product_id,
            purchase_date: new Date().toISOString(),
        }));

        axios.post('http://localhost:8080/api/orders/add', orderItems)
            .then(response => {
                console.log('Purchase successful:', response.data);
                // Optionally, you can clear the cart items after successful purchase
                setCartItems([]);
            })
            .catch(error => console.error('Error purchasing:', error));
    };


    const handleIncrement = (item) => {
        // Logic to increment the item count
        setCartItems((prevItems) => {
            const updatedItems = prevItems.map((prevItem) =>
                prevItem.product_id === item.product_id
                    ? { ...prevItem, count: prevItem.count + 1 }
                    : prevItem
            );
            return updatedItems;
        });
    };

    const handleDecrement = (item) => {
        // Logic to decrement the item count
        setCartItems((prevItems) => {
            const updatedItems = prevItems.map((prevItem) =>
                prevItem.product_id === item.product_id
                    ? { ...prevItem, count: Math.max(prevItem.count - 1, 0) } // Ensure count is not negative
                    : prevItem
            );
            return updatedItems.filter((item) => item.count > 0); // Remove items with count 0
        });
    };

    const toggleDropdown = () => {
        console.log(products); // Add this line
        setDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="container">
            <div className="top-bar">
                <h1>Grocery Store</h1>
                <div className="cart-container" onClick={toggleDropdown}>
                    <ShoppingCartIcon fontSize="large"/>
                    {cartItems.length > 0 && (
                        <div className="cart-dropdown">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="cart-item">
                                    <p>
                                        Item {item.name}: {item.count}
                                    </p>
                                    <div className="cart-buttons">
                                        <button onClick={() => handleIncrement(item)}>+</button>
                                        <button onClick={() => handleDecrement(item)}>-</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleBuy}>Buy</button>
                        </div>
                    )}
                </div>
            </div>


            {loading && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            )}

            {error && (
                <div className="error">
                    <h2>Error:</h2>
                    <p>{error}</p>
                </div>
            )}

            {(products.length > 0 && !loading) && (
                <div>
                    <h2>Products:</h2>
                    <div className="table-container">
                        <table className="styled-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Add to Cart</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product) => (
                                <tr key={product.product_id}>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td width={100}>
                                        <button onClick={() => handleAddToCart(product)}>
                                            <AddShoppingCartIcon fontSize="large"/>                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && products.length === 0 && (
                <p className="loading">No products available.</p>
            )}
        </div>
    );
}

export default App;
