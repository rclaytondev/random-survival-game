# random-survival-game
Simple browser (HTML / JavaScript) game in which you control a stick figure, dodging random obstacles in a 2d platformer setting.

CHANGELOG
version 1.0

* Random events - come every 5 seconds, take around 5 seconds to complete:
    * Lasers - a crosshair appears, teleports around randomly, centers on player, blinks, then explodes
	* Rising acid (with moving screen).
	* Boulders - They bounce off the platforms.
	* Spinning blades (they appear at the center of each platform, and take up all the space).
	* Jumping pirhanas (they jump up in sets of 3 from the bottom of the screen).
	* Giant pac-men (they come in sets of 2, one from each side of the screen. One takes up the top half, another the bottom. Very slow.)
	* Rockets - they shoot at you from the sides of the screen.
	* Spike balls - unaffected by gravity, they bounce off the edges of the screen.
	* Blindness - you can't see!
	* Confusion - left goes right, right goes left. Jump is still up.
 * Shop:
	* "Piggy Bank of Money" - "With this amazing piggy bank, twice as many coins will appear in game."
		* No upgrades (5 coins): coins are doubled
		* 1 Upgrade (10 coins): coins are attracted when within a certain radius
		* 2 Upgrades (15 coins): coins are attracted regardless of distance
	* "Potion of Jumpiness" - "Drink this potion to be able to doublejump!"
		* No upgrades (10 coins): jump higher
		* 1 Upgrade (10 coins): double jump
		* 2 Upgrades (10 coins): double jump higher
	* "Boots of Speediness" - "These speedy boots make you run twice as fast."
		* No upgrades (10 coins): max speed is 150% faster (4.5 pixels/frame)
		* 1 Upgrade (10 coins): accelerate twice as fast
		* 2 Upgrades (10 coins): max speed is twice as fast 
    * "Talisman of Intangibility" - "Walk through walls, floors, and enemies with this magical talisman. Press down to use"
		* No upgrades (10 coins): player becomes intangible
		* 1 Upgrade (10 coins): intangible player can wrap on edges of screen
		* 2 Upgrades (15 coins): intangible player can still collect coins
	* "Skull of Reanimation" - "Come back from the dead! This ancient skull grants you an extra life each game."
		* No upgrades (15 coins): one extra life, 2 lives total
		* 1 Upgrade (10 coins): longer invincibility frames
		* 2 Upgrades (15 coins): two extra lives, 3 lives total
	* "Box of Storage - allows you to carry an extra shop item - "Are your hands full? Carry an extra shop item with you each run."
		* No upgrades (15 coins): one extra item, 2 items total
* Achievements:
 	* "Improvement" - beat your record 5 times - a plus sign
	* "Seen it All" - survive all the events - an eye
	* "What are the Odds" - experience the same event twice in a row - a die
	* "Moneybags" - buy something in the shop
	* "Extreme Moneybags" - buy everything in the shop!
	* "Survivalist" - get a score of 10 - a heart
	* "Extreme Survivalist" - get a score of 20 - 2 hearts
	* "Ghost" - "secret achievement" - become intangible after having already died that game - a pacman ghost
	* "Places to Be" - "secret achievement" - double jump while running over the speed limit - a guy running
**/
