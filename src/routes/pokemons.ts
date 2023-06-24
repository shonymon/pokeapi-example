/** src/routes/pokemons.ts */
import express from 'express';
import controller from '../controllers/pokemons';
const router = express.Router();

router.get('/pokemons/get', controller.getPokemons);
router.post('/pokemon/search', controller.searchPokemon);

export = router;