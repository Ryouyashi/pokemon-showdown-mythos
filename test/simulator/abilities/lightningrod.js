'use strict';

const assert = require('./../../assert');
let battle;

describe('Lightning Rod', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should grant immunity to Electric-type moves and boost Special Attack by 1 stage', function () {
		battle = BattleEngine.Battle.construct();
		battle.join('p1', 'Guest 1', 1, [{species: 'Manectric', ability: 'lightningrod', moves: ['sleeptalk']}]);
		battle.join('p2', 'Guest 2', 1, [{species: 'Jolteon', ability: 'static', moves: ['thunderbolt']}]);
		battle.commitDecisions();
		assert.fullHP(battle.p1.active[0]);
		assert.statStage(battle.p1.active[0], 'spa', 1);
	});

	it('should not boost Special Attack if the user is already immune to Electric-type moves', function () {
		battle = BattleEngine.Battle.construct();
		battle.join('p1', 'Guest 1', 1, [{species: 'Rhydon', ability: 'lightningrod', moves: ['sleeptalk']}]);
		battle.join('p2', 'Guest 2', 1, [{species: 'Jolteon', ability: 'static', moves: ['thunderbolt']}]);
		battle.commitDecisions();
		assert.statStage(battle.p1.active[0], 'spa', 0);
	});

	it('should redirect single-target Electric-type attacks to the user if it is a valid target', function () {
		this.timeout(3000);
		battle = BattleEngine.Battle.construct('battle-triples-lightningrod', 'triplescustomgame');
		const p1 = battle.join('p1', 'Guest 1', 1, [
			{species: 'Manectric', ability: 'lightningrod', moves: ['sleeptalk']},
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
		]);
		const p2 = battle.join('p2', 'Guest 2', 1, [
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
		]);
		battle.commitDecisions(); // Team Preview
		p1.chooseMove(1).chooseMove(1, 1).chooseMove(1, 1);
		p2.chooseMove(1, 3).chooseMove(1, 3).chooseMove(1, 2);
		assert.statStage(battle.p1.active[0], 'spa', 3);
		assert.false.fullHP(battle.p1.active[2]);
		assert.false.fullHP(battle.p2.active[0]);
	});

	it('should redirect to the fastest Pokemon with the ability', function () {
		battle = BattleEngine.Battle.construct('battle-lightningrod-speed', 'doublescustomgame');
		const p1 = battle.join('p1', 'Guest 1', 1, [
			{species: 'Manectric', ability: 'lightningrod', moves: ['sleeptalk']},
			{species: 'Manectric', ability: 'lightningrod', moves: ['sleeptalk']},
		]);
		battle.join('p2', 'Guest 2', 1, [
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
		]);
		battle.commitDecisions(); // Team Preview
		p1.active[0].boostBy({spe: 6});
		p1.chooseMove(1).chooseMove(1).foe.chooseMove(1, 1).chooseMove(1, 2);
		assert.statStage(p1.active[0], 'spa', 2);
		assert.statStage(p1.active[1], 'spa', 0);
	});

	it('should redirect to the Pokemon having the ability longest', function () {
		battle = BattleEngine.Battle.construct('battle-lightningrod-speed', 'doublescustomgame');
		const p1 = battle.join('p1', 'Guest 1', 1, [
			{species: 'Meloetta', ability: 'serenegrace', moves: ['roleplay']},
			{species: 'Pikachu', ability: 'lightningrod', moves: ['sleeptalk']},
		]);
		battle.join('p2', 'Guest 2', 1, [
			{species: 'Pichu', ability: 'static', moves: ['thunderbolt']},
			{species: 'Pichu', ability: 'static', moves: ['thunderbolt']},
		]);
		battle.commitDecisions(); // Team Preview
		p1.chooseMove(1, -2).chooseMove(1).foe.chooseMove(1, 1).chooseMove(1, 2);
		assert.statStage(p1.active[0], 'spa', 0);
		assert.statStage(p1.active[1], 'spa', 2);
	});

	it('should not redirect if another Pokemon has used Follow Me', function () {
		battle = BattleEngine.Battle.construct('battle-lightningrod-followme', 'doublescustomgame');
		const p1 = battle.join('p1', 'Guest 1', 1, [
			{species: 'Manectric', ability: 'lightningrod', moves: ['sleeptalk']},
			{species: 'Manectric', ability: 'static', moves: ['followme']},
		]);
		battle.join('p2', 'Guest 2', 1, [
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
			{species: 'Electrode', ability: 'static', moves: ['thunderbolt']},
		]);
		battle.commitDecisions(); // Team Preview
		p1.active[0].boostBy({spe: 6});
		p1.chooseMove(1).chooseMove(1).foe.chooseMove(1, 2).chooseMove(1, 1);
		assert.statStage(p1.active[0], 'spa', 0);
		assert.false.fullHP(p1.active[1]);
	});

	it('should have its Electric-type immunity and its ability to redirect moves suppressed by Mold Breaker', function () {
		battle = BattleEngine.Battle.construct('battle-moldbreaker-lightningrod', 'doublescustomgame');
		const p1 = battle.join('p1', 'Guest 1', 1, [
			{species: 'Manectric', ability: 'lightningrod', moves: ['endure']},
			{species: 'Manaphy', ability: 'hydration', moves: ['tailglow']},
		]);
		const p2 = battle.join('p2', 'Guest 2', 1, [
			{species: 'Haxorus', ability: 'moldbreaker', moves: ['thunderpunch']},
			{species: 'Zekrom', ability: 'teravolt', moves: ['shockwave']},
		]);
		battle.commitDecisions(); // Team Preview
		p2.chooseMove(1, 1).chooseMove(1, 2).foe.chooseDefault();
		assert.false.fullHP(p1.active[0]);
		assert.false.fullHP(p1.active[1]);
	});
});
