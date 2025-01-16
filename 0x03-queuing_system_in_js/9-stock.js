import express from 'express';
import redis from 'redis';
import { promisify } from 'util';
import listProducts from './listProducts';

const app = express();
const port = 1245;

const client = redis.createClient();
client.on('error', (err) => console.error(`Redis error: ${err}`));

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

function getItemById(id) {
  return listProducts.find((item) => item.id === id);
}
async function reserveStockById(itemId) {
  const item = getItemById(itemId);
  if (item && item.stock > 0) {
    item.stock -= 1;
    await setAsync(`item.${itemId}`, item.stock); // Save to Redis
    return true;
  }
  return false;
}

async function getCurrentReservedStockById(itemId) {
  const value = await getAsync(`item.${itemId}`);
  return value !== null ? parseInt(value, 10) : 0;
}

app.get('/list_products', (_, res) => {
  const formattedProducts = listProducts.map(item => ({
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    initialAvailableQuantity: item.stock
  }));
  res.json(formattedProducts);
});

app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const item = getItemById(itemId);

  if (!item) {
    return res.status(404).json({ status: 'Product not found' });
  }

  const currentQuantity = await getCurrentReservedStockById(itemId);
  res.json({
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    initialAvailableQuantity: item.stock,
    currentQuantity: currentQuantity
  });
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const item = getItemById(itemId);

  if (!item) {
    return res.status(404).json({ status: 'Product not found' });
  }

  if (item.stock <= 0) {
    return res.status(400).json({ status: 'Not enough stock available', itemId: item.id });
  }

  const reserved = await reserveStockById(itemId);
  if (reserved) {
    res.json({ status: 'Reservation confirmed', itemId: item.id });
  } else {
    res.status(400).json({ status: 'Not enough stock available', itemId: item.id });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
