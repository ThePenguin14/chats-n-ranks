import { EntityQueryOptions, world } from "mojang-minecraft";

var cmdPrefix = '!';
var chatFormat = genFormatIns("<{name}> {msg}");
var adminTag = "admin";
var rankNames = {};
var assumeScore = 0;
var minChatRank = 0;
world.events.beforeChat.subscribe((e) => {
	let cancel = false;
	e.cancel = true;
	if(e.message.startsWith(cmdPrefix)){
		switch(e.message.substring(cmdPrefix.length, e.message.includes(" ") ? e.message.indexOf(" ") + 1 : undefined)){
			case "setchatformat ":
				if(e.sender.hasTag(adminTag)){
					chatFormat = genFormatIns(e.message.substring(cmdPrefix.length + 14));
					tellAsync(e.sender, `§r§eSuccessfully set the new chat format to §f${chatFormat.originalString}§r§e.`);
				}
				else noPermission(e.sender, "setchatformat");
				cancel = true;
				break;
			case "setadmintag ":
				if(e.sender.hasTag(adminTag)){
					adminTag = e.message.substring(cmdPrefix.length + 12);
					tellAsync(e.sender, `§r§eSuccessfully set the new admin tag to §a${adminTag}§r§e.`);
				}
				else noPermission(e.sender, "setadmintag");
				cancel = true;
				break;
			case "getadmintag":
				tellAsync(e.sender, `§r§eThe current admin tag is: §a${adminTag}§r§e.`);
				cancel = true;
				break;
			case "getchatformat":
				if(e.sender.hasTag(adminTag)) tellAsync(e.sender, `§r§eThe current chat format is:§f ${chatFormat.originalString}§r§e.`);
				else noPermission(e.sender, "getchatformat");
				cancel = true;
				break;
			case "setuprank":
				if(e.sender.hasTag(adminTag)){
					try{
						e.sender.runCommand("scoreboard objectives add mt_rank dummy Rank");
						tellAsync(e.sender, "§r§eSet up the rank system.");
					}
					catch{

					}
				}
				else noPermission(e.sender, "setuprank");
				cancel = true;
				break;
			case "save":
				tell(e.sender, "§bSaving and loading doesn't currently work. As GameTest develops or if I figure out a better way, I'll try!");
				if(e.sender.hasTag(adminTag)){
					try{
						let obj = world.scoreboard.getObjective("mt_save");
						if(obj !== null && obj !== undefined) e.sender.runCommand("scoreboard objectives remove mt_save");
					}
					catch{

					}
					try{
						e.sender.runCommand(`scoreboard objectives add mt_save dummy "${makeSaveString()}"`);
					tellAsync(e.sender, "§r§eSuccessfully saved save state.");
					}
					catch{
						tellAsync(e.sender, `§r§cFailed to save save state.`);
					}
				}
				else noPermission(e.sender, "save");
				cancel = true;
				break;
			case "discardsave":
				if(e.sender.hasTag(adminTag)){
					try{
						let obj = world.scoreboard.getObjective("mt_save");
						if(obj !== null && obj !== undefined) e.sender.runCommand("scoreboard objectives remove mt_save");
						tellAsync(e.sender, "§r§eSuccessfully erased saved state.");
					}
					catch{
						tellAsync(e.sender, "§r§cFailed to erase save state as none was found.");
					}
				}
				else noPermission(e.sender, "discardsave");
				cancel = true;
				break;
			case "load":
				tell(e.sender, "§bSaving and loading doesn't currently work. As GameTest develops or if I figure out a better way, I'll try!");
				if(e.sender.hasTag(adminTag)){
					try{
						let obj = world.scoreboard.getObjective("mt_save");
						if(obj !== null && obj !== undefined){
							let str = world.scoreboard.getObjective("mt_save").displayName;
							loadSaveString(str.substring(1, str.length - 1));
							tellAsync(e.sender, "§r§eSuccessfully loaded last save state.");
						}
						else tellAsync(e.sender, "§r§cNo save state was found. Are you sure you ran §4!save§c earlier?");
					}
					catch{
						tellAsync(e.sender, "§r§cNo save state was found. Are you sure you ran §4!save§c earlier?");
					}
				}
				else noPermission(e.sender, "load");
				cancel = true;
				break;
			case "mute ":
				if(e.sender.hasTag(adminTag)){
					let name = e.message.substring(e.message.indexOf(' ') + 1);
					if(name !== null && name !== undefined && name.length > 0){
						try{
							e.sender.runCommandAsync(`tag "${name}" add mt_muted`);
							tellAsync(e.sender, `§r§eSuccessfully muted §a${name}§r§e.`);
						}
						catch{
							tellAsync(e.sender, `§r§cDidn't mute §a${name}§r§c as he is already muted, doesn't exist, or isn't currently on the world.`);
						}
					}
					else tellAsync(e.sender, "§c!mute command must follow the following syntax: §4!mute <player>§c where §4player§c is the player's name.");
				}
				else noPermission(e.sender, "mute");
				cancel = true;
				break;
			case "unmute ":
				if(e.sender.hasTag(adminTag)){
					let name = e.message.substring(e.message.indexOf(' ') + 1);
					if(name !== null && name !== undefined && name.length > 0){
						try{
							e.sender.runCommandAsync(`tag "${name}" remove mt_muted`);
							tellAsync(e.sender, `§r§eSuccessfully unmuted §a${name}§r§e.`);
						}
						catch{
							tellAsync(e.sender, `§r§cDidn't unmute §a${name}§r§c as he wasn't muted, doesn't exist, or isn't currently on the world.`);
						}
					}
					else tellAsync(e.sender, "§c!unmute command must follow the following syntax: §4!unmute <player>§c where §4player§c is the player's name.");
				}
				else noPermission(e.sender, "unmute");
				cancel = true;
				break;
			case "setminchatrank ":
				if(e.sender.hasTag(adminTag)){
					let r = parseInt(e.message.substring(e.message.indexOf(' ') + 1));
					if(r !== null && r !== undefined && !isNaN(r)){
						minChatRank = r;
						tellAsync(e.sender, `§r§eSuccessfully set the minimum chat rank to §b${r}§r§e.`);
					}
					else tellAsync(e.sender,
						"§c!setminchatrank command must follow the following syntax: §4!setminchatrank <num>§c where §4num§c is the minimum rank to chat. §b0§c would mean everyone can chat.");
				}
				else noPermission(e.sender, "setminchatrank");
				cancel = true;
				break;
			case "getminchatrank":
				if(e.sender.hasTag(adminTag)){
					tellAsync(e.sender, `§r§eThe current minimum chat rank is: §a${minChatRank}§r§e.`);
				}
				else noPermission(e.sender, "getminchatrank");
				cancel = true;
				break;
			case "credits": case "credit":
				tellAsync(e.sender, "\n§bChats 'n' Ranks§3 add-on created by §bA Teal Penguin§3.\n§4YouTube: §chttps://youtube.com/c/ATealPenguin\n");
				cancel = true;
				break;
			case "promote":
				if(e.sender.hasTag(adminTag)){
					let name = e.message.substring(e.message.indexOf(' ') + 1);
					if(name !== null && name !== undefined && name.length > 0){
						try{
							try{
								e.sender.runCommandAsync(`scoreboard players add "${name}" mt_rank 1`);
							}
							catch{
								e.sender.runCommandAsync(`scoreboard players set "${name}" mt_rank 1`);
							}
							tellAsync(e.sender, `§r§eSuccessfully promoted §a${name}§r§e.`);
						}
						catch{
							tellAsync(e.sender, `§r§cDidn't promote §a${name}§r§c as he doesn't exist or isn't currently on the world.`);
						}
					}
					else tellAsync(e.sender, "§c!promote command must follow the following syntax: §4!promote <player>§c where §4player§c is the player's name.");
				}
				else noPermission(e.sender, "promote");
				cancel = true;
				break;
			case "demote":
				if(e.sender.hasTag(adminTag)){
					let name = e.message.substring(e.message.indexOf(' ') + 1);
					if(name !== null && name !== undefined && name.length > 0){
						try{
							try{
								e.sender.runCommandAsync(`scoreboard players remove "${name}" mt_rank 1`);
							}
							catch{
								e.sender.runCommandAsync(`scoreboard players set "${name}" mt_rank 0`);
							}
							tellAsync(e.sender, `§r§eSuccessfully demoted §a${name}§r§e.`);
						}
						catch{
							tellAsync(e.sender, `§r§cDidn't demote §a${name}§r§c as he doesn't exist or isn't currently on the world.`);
						}
					}
					else tellAsync(e.sender, "§c!demote command must follow the following syntax: §4!demote <player>§c where §4player§c is the player's name.");
				}
				else noPermission(e.sender, "demote");
				cancel = true;
				break;
			case "namerank ":
				if(e.sender.hasTag(adminTag)){
					let num;
					if(!isNaN(num = parseInt(e.message.substring(cmdPrefix.length + 9, e.message.indexOf(' ', cmdPrefix.length + 10)))) && num >= 0){
						let str = e.message.substring(e.message.indexOf(' ', cmdPrefix.length + 10) + 1);
						rankNames[`_${num}`] = str;
						tellAsync(e.sender, `§r§eSuccessfully set rank §b${num}§e's name to §a${str}§r§e.`);
					}
					else tellAsync(e.sender, "§c!namerank command must follow the following syntax: §4!namerank <num> <name>§c where §b0§c is the lowest rank.");
				}
				else noPermission(e.sender, "namerank");
				cancel =  true;
				break;
			case "coords":
				tellAsync(e.sender, `§r§eYour current coordinates are §a${e.sender.location.x}§e, §a${e.sender.location.y}§e, §a${e.sender.location.z}§e.`);
				cancel = true;
				break;
			default:
				break;
		}
	}
	if(!cancel){
		if(e.sender.hasTag("mt_muted")) {
			tellAsync("§cYou cannot chat as you are muted.");
			return;
		}
		let rank;
		try{
			rank = e.sender.scoreboard === null || e.sender.scoreboard === undefined ? 0 : world.scoreboard.getObjective("mt_rank").getScore(e.sender.scoreboard) ?? 0;
		}
		catch{
			e.sender.runCommand(`scoreboard players set "${e.sender.name}" mt_rank 0`);
			rank = 0;
		}
		if(rank < minChatRank){
			tellAsync(e.sender,
				`§cYou must at least be rank ${(rankNames[`_${minChatRank}`] ? `${rankNames[`_${minChatRank}`]} (${minChatRank})` : String(minChatRank))}§r§c to chat.`);
			return;
		}
		reqLoop(e, rank);
		/*let msgBlock = { sender: e.sender };
		if(chatFormat.requires.includes("name")) msgBlock.name = e.sender.name;
		if(chatFormat.requires.includes("msg")) msgBlock.msg = e.message;
		if(chatFormat.requires.includes("rank")) {
			msgBlock.rank = rankNames[`_${rank}`] ? rankNames[`_${rank}`] : String(rank);
		}
		if(chatFormat.requires.includes("utc")){
			let d = new Date();
			msgBlock.utc = `${d.getUTCHours()}:${d.getUTCMinutes()}`;
		}
		if(chatFormat.requires.includes("hp")) msgBlock.hp = e.sender.getComponent("minecraft:health").current;
		if(chatFormat.requires.includes("x")) msgBlock.x = Math.floor(e.sender.location.x);
		if(chatFormat.requires.includes("xf")) msgBlock.xf = e.sender.location.x;
		if(chatFormat.requires.includes("y")) msgBlock.y = Math.floor(e.sender.location.y);
		if(chatFormat.requires.includes("yf")) msgBlock.yf = e.sender.location.y;
		if(chatFormat.requires.includes("z")) msgBlock.z = Math.floor(e.sender.location.z);
		if(chatFormat.requires.includes("zf")) msgBlock.zf = e.sender.location.z;
		for(let i = 0; i < chatFormat.requires.length; i++){
			if(chatFormat.requires[i].startsWith("score=")){
				try{
					msgBlock[chatFormat.requires[i]] = e.sender.scoreboard === null || e.sender.scoreboard === undefined ? assumeScore :
						world.scoreboard.getObjective(chatFormat.requires[i].substring(6)).getScore(e.sender.scoreboard) ?? assumeScore;
				}
				catch{
					msgBlock[chatFormat.requires[i]] = 0;
				}
			}
			else if(chatFormat.requires[i].startsWith("title=")){
				let tags = e.sender.getTags();
				let str = chatFormat.requires[i].substring(6);
				for(let j = 0; j < tags.length; j++){
					if(tags[j].startsWith(str)){
						msgBlock[chatFormat.requires[i]] = tags[j].substring(str.length);
					}
				}
				if(!msgBlock[chatFormat.requires[i]]) msgBlock[chatFormat.requires[i]] = "";
			}
		}
		e.sender.runCommandAsync(`tellraw @a {"rawtext": [{"text": "${chatFormat.format(msgBlock)}"}]}`);*/
	}
});

function genFormatIns(str){
	let insNames = [];
	let b = "";
	let sarr = [];
	let requires = [];

	for(let i = 0; i < str.length; i++){
		if(str[i] === '{'){
			if(str[i + 1] === '{'){
				b += "{";
				i++;
			}
			else{
				sarr.push(b);
				b = "";
				let name = "";
				i++;
				for(; i < str.length; i++){
					if(str[i] === '}') break;
					else name += str[i];
				}
				if(!interpName(name, insNames, requires, sarr)) b = sarr.pop();
			}
		}
		else b += str[i];
	}
	sarr.push("");

	return {
		originalString: str,
		strings: sarr,
		insNames: insNames,
		requires : requires,
		format: function(obj){
			let b = "";
			let v;
			for(let i = 0; i < this.strings.length; i++){
				b += this.strings[i];
				if(i < this.insNames.length) {
					v = obj[this.insNames[i]];
					b += typeof(v) === "function" ? v(obj) : v;
				}
			}
			return b;
		}
	};
}
function tell(player, msg){
	player.runCommand(`tellraw ${player.name} {"rawtext": [{"text": "${msg}"}]}`);
}
function tellAsync(player, msg){
	player.runCommandAsync(`tellraw ${player.name} {"rawtext": [{"text": "${msg}"}]}`);
}
function noPermission(player, cmd = undefined){
	tellAsync(player, cmd ? `You do not have permission to run !${cmd}.` : "You do not have permission to do that.");
}
function noPermissionSync(player, cmd = undefined){
	tell(player, cmd ? `You do not have permission to run !${cmd}.` : "You do not have permission to do that.");
}
var saveVersion = 1;
function makeSaveString(){
	let b = "";
	b += padLeft(saveVersion, 3);
	b += padLeft(chatFormat.originalString.length, 3);
	b += chatFormat.originalString;
	b += padLeft(rankNames.length, 2);
	for(let i = 0; i < rankNames.length; i++){
		b += padLeft(rankNames[`_${i}`].length, 2);
		b += rankNames[`_${i}`];
	}
	return b;
}
function loadSaveString(str){
	if(parseInt(str.substring(0, 3)) === 1){
		let cfLen = parseInt(subs(str, 3, 3));
		chatFormat = genFormatIns(subs(str, 6, cfLen));
		rankNames = {};
		let lastInx = cfLen + 6;
		let rankNameLen = subs(str, lastInx, 2);
		lastInx += 2;
		for(let i = 0; i < rankNameLen; i++){
			let len = parseInt(subs(str, lastInx, 2));
			rankNames[`_${i}`] = subs(str, lastInx + 2, len);
			lastInx += len + 2;
		}
	}
}
function padLeft(num, size) {
    var s = "000" + num;
    return s.substring(s.length - size);
}
function subs(str, index, len){
	return str.substring(index, index + len);
}
function interpName(name, insNames, requires, sarr){
	/*b = "";
	val = null;
	for(let i = 0; i < name.length; i++){
		if(name[i] === '"'){
			str = "";
			i++;
			for(; i < name.length; i++){
				if(name[i] === '"') break;
				else if(name[i] === '\\'){
					if(name[++i] === '"') str += name[i];
				}
				else str += name[i];
			}
			val = str;
		}
		else if(name[i] === '>' && name[i + 1] === '>'){
			i++;

		}
		else b += name[i];
	}*/
	if(name.startsWith("color=")){
		switch(name.substring(6).replace("_", "")){
			case "black":
				sarr[sarr.length - 1] += "§0";
				break;
			case "darkblue":
				sarr[sarr.length - 1] += "§1";
				break;
			case "darkgreen":
				sarr[sarr.length - 1] += "§2";
				break;
			case "darkaqua": case "darkcyan":
				sarr[sarr.length - 1] += "§3";
				break;
			case "darkred":
				sarr[sarr.length - 1] += "§4";
				break;
			case "darkpurple":
				sarr[sarr.length - 1] += "§5";
				break;
			case "gold":
				sarr[sarr.length - 1] += "§6";
				break;
			case "gray": case "grey":
				sarr[sarr.length - 1] += "§7";
				break;
			case "darkgray": case "darkgrey":
				sarr[sarr.length - 1] += "§8";
				break;
			case "blue":
				sarr[sarr.length - 1] += "§9";
				break;
			case "green":
				sarr[sarr.length - 1] += "§a";
				break;
			case "aqua": case "cyan":
				sarr[sarr.length - 1] += "§b";
				break;
			case "red":
				sarr[sarr.length - 1] += "§c";
				break;
			case "darkpurple": case "purple":
				sarr[sarr.length - 1] += "§d";
				break;
			case "yellow":
				sarr[sarr.length - 1] += "§e";
				break;
			case "white":
				sarr[sarr.length - 1] += "§f";
				break;
			case "minecoingold":
				sarr[sarr.length - 1] += "§g";
				break;
			default:
				break;
		}
		return false;
	}
	else if(name.startsWith("style=")){
		switch(name.substring(6)){
			case "reset":
				sarr[sarr.length - 1] += "§r";
				break;
			case "obfuscate": case "obfuscated":
				sarr[sarr.length - 1] += "§k";
				break;
			case "bold": case "bolded":
				sarr[sarr.length - 1] += "§l";
				break;
			case "strikethrough": case "strikedthrough": case "strikeout": case "strikedout":
				sarr[sarr.length - 1] += "§m";
				break;
			case "underline": case "underlined":
				sarr[sarr.length - 1] += "§n";
				break;
			case "italic": case "italics": case "italicized":
				sarr[sarr.length - 1] += "§o";
				break;
		}
		return false;
	}
	else if(name.startsWith("char=")){
		sarr[sarr.length - 1] += String.fromCodePoint(parseInt(name.substring(5), 16));
		return false;
	}
	else{
		insNames.push(name);
		if(!requires.includes(name)) requires.push(name);
		return true;
	}
}
world.events.worldInitialize.subscribe(() => {
	try{
		let obj = world.scoreboard.getObjective("mt_save");
		if(obj !== null && obj !== undefined){
			loadSaveString(world.scoreboard.getObjective("mt_save").displayName);
		}
	}
	catch{
		
	}
});
function reqLoop(e, rank){
	let msgBlock = { sender: e.sender };
	for(let i = 0; i < chatFormat.requires.length; i++){
		let r = chatFormat.requires[i];
		if(r === "name") msgBlock.name = e.sender.name;
		else if(r === "msg") msgBlock.msg = e.message;
		else if(r === "rank") {
			msgBlock.rank = rankNames[`_${rank}`] ? rankNames[`_${rank}`] : String(rank);
		}
		else if(r === "utc"){
			let d = new Date();
			msgBlock.utc = `${d.getUTCHours()}:${padLeft(d.getUTCMinutes(), 2)}`;
		}
		else if(r === "hp") msgBlock.hp = e.sender.getComponent("minecraft:health").current;
		else if(r === "x") msgBlock.x = Math.floor(e.sender.location.x);
		else if(r === "xf") msgBlock.xf = e.sender.location.x;
		else if(r === "y") msgBlock.y = Math.floor(e.sender.location.y);
		else if(r === "yf") msgBlock.yf = e.sender.location.y;
		else if(r === "z") msgBlock.z = Math.floor(e.sender.location.z);
		else if(r === "zf") msgBlock.zf = e.sender.location.z;
		else if(chatFormat.requires[i].startsWith("score=")){
			try{
				msgBlock[chatFormat.requires[i]] = e.sender.scoreboard === null || e.sender.scoreboard === undefined ? assumeScore :
					world.scoreboard.getObjective(chatFormat.requires[i].substring(6)).getScore(e.sender.scoreboard) ?? assumeScore;
			}
			catch{
				msgBlock[chatFormat.requires[i]] = 0;
			}
		}
		else if(chatFormat.requires[i].startsWith("title=")){
			let tags = e.sender.getTags();
			let str = chatFormat.requires[i].substring(6);
			for(let j = 0; j < tags.length; j++){
				if(tags[j].startsWith(str)){
					msgBlock[chatFormat.requires[i]] = tags[j].substring(str.length);
				}
			}
			if(!msgBlock[chatFormat.requires[i]]) msgBlock[chatFormat.requires[i]] = "";
		}
	}
	e.sender.runCommandAsync(`tellraw @a {"rawtext": [{"text": "${chatFormat.format(msgBlock)}"}]}`);
}