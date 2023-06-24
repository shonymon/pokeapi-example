/** src/controllers/pokemons.ts */
import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { orderByName } from '../utils/orderByName';
import { isStringNumber } from '../utils/isStringNumber';
import { PokemonResult, Ability } from '../types/pokemonResult';
import { PokemonResults, Pokemon } from '../types/pokemonResults';

// Getting pokemons
const getPokemons = async (req: Request, res: Response) => {

    // Query Params
    const limit: string = req.query.limit as string ?? '10', // Type Assertion
        page: string = req.query.page as string,
        search: string = req.query.search as string;

    // Invalid Query Params Check
    if (! isStringNumber(limit) || ! isStringNumber(page)) {
        return res.status(422).json({ error: 'Invalid Request Query Params' });
    }

    // Request to Pokeapi
    const result: AxiosResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${page}`),
        pokemonResult: PokemonResults = result.data;

    // Order
    let pokemons: Pokemon[] = pokemonResult.results.sort((a: Pokemon, b: Pokemon) => orderByName(a.name, b.name));

    // Search
    if (search) {
        pokemons = pokemons.filter(pokemon => pokemon.name.indexOf(search) >= 0);
    }
    
    return res.status(200).json({ 
        pokemons: pokemons, 
        params: { limit: limit, page: page, search: search }
    });
};

// Search for Pokemon
const searchPokemon = async (req: Request, res: Response) => {

    const name: string = req.body.name as string;

    if (! name) {
        return res.status(422).json({ error: 'Invalid Request Query Params' });
    }

    // Request to Pokeapi
    try {
        const result: AxiosResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`),
            pokemonResult: PokemonResult = result.data;

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ bufferPages: true });

        let buffers: any[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {

            let pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(pdfData),
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=pokemon.pdf',})
            .end(pdfData);

        });

        // doc.pipe(fs.createWriteStream('/temp/pokemon.pdf'));
        // doc.pipe(res);

        doc.info['Title'] = pokemonResult.name;
        doc.info['Author'] = 'shony & pokeapi.co';

        doc.fontSize(25).text('Pokemon: ' + pokemonResult.name);

        pokemonResult.abilities.forEach(Ability => {
            doc.text('ability: ' + Ability.ability.name);
        });

        doc.text('base_experience: ' + pokemonResult.base_experience);

        pokemonResult.forms.forEach(Species => {
            doc.text('form: ' + Species.name + ` (${Species.url})`);
        });

        pokemonResult.game_indices.forEach(GameIndex => {
            doc.text('game_indices: ' + GameIndex.game_index + ` Ver(${GameIndex.version.name})`);
        });

        doc.text('height: ' + pokemonResult.height);
        doc.text('id: ' + pokemonResult.id);
        doc.text('is_default: ' + pokemonResult.is_default);
        doc.text('location_area_encounters: ' + pokemonResult.location_area_encounters);
        doc.text('name: ' + pokemonResult.name);
        doc.text('order: ' + pokemonResult.order);
        doc.text('weight: ' + pokemonResult.weight);
    
        doc.end();
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('axios error message: ', error.message);
            return res.status(404).json({
                message: "Pokemon not found!",
                error: error.message
            });
        } else {
            console.log('unexpected error: ', error);
            return res.status(422).json({ error: 'An unexpected error occurred' });
        }
    }
};

export default { getPokemons, searchPokemon };