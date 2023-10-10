// url invitation : https://discord.com/api/oauth2/authorize?client_id=1151459423550705694&permissions=8&scope=bot
(async () =>{
    const debug = true;
    const vipCategoryName = "BATAILLE VIP"
const { EmbedBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, EmbedAssertions, Embed, AttachmentBuilder, PresenceUpdateStatus, ChannelType, PermissionOverwrites, PermissionFlagsBits } = require('discord.js');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;

const filePath = 'data.json';
const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function readJsonFile(filePath) {
    try {
      const jsonData = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(jsonData);
      return parsedData;
    } catch (err) {
      console.error('Error reading JSON file:', err);
      return {};
    }
  }
// Create a new DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const database = await readJsonFile(filePath);

// Access the document and body element
const document = dom.window.document;
// Fonction pour créer le tableau
function addStylesToDocument() {
    var css = `/* Style de base pour le tableau */
    table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 20px;
    }
    
    th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
    }
    
    /* Style pour la ligne d'en-têtes */
    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    
    /* Style pour la cellule "Serveur" */
    th[colspan="1"] {
        background-color: #e0e0e0;
    }
    
    /* Style pour la cellule "Période" */
    th[colspan="3"] {
        background-color: #e0e0e0;
    }
    
    /* Style pour la cellule "Semaine" */
    th[colspan="4"] {
        background-color: #e0e0e0;
    }
    
    /* Style pour les cellules de données */
    td {
        background-color: #fff;
    }
    
    /* Style pour les cellules du week-end */
    td:nth-child(5), td:nth-child(6), td:nth-child(7), td:nth-child(8) {
        background-color: #fff;
    }`;

    var styleElement = document.createElement('style');
    if (styleElement.styleSheet) {
        // Pour les anciennes versions d'Internet Explorer
        styleElement.styleSheet.cssText = css;
    } else {
        // Pour les navigateurs modernes
        styleElement.appendChild(document.createTextNode(css));
    }

    // Ajoute la balise <style> au document
    document.head.appendChild(styleElement);
}
function createTable(headers){
    var table = document.createElement('table');
    var headerRow = document.createElement('tr');

    for (var i = 0; i < headers.length; i++) {
        var headerCell = document.createElement('th');
        headerCell.textContent = headers[i];
        headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);
    document.body.appendChild(table);
}
function createDoubleTable(bigHeaders,headers) {
    // Crée un tableau HTML
    var table = document.createElement('table');

    // Crée la première ligne pour les en-têtes
    var bigHeaderRow = document.createElement('tr');

    var serveurCell = document.createElement('th');
    serveurCell.textContent =bigHeaders[0];
    serveurCell.setAttribute('colspan', '1');

    bigHeaderRow.appendChild(serveurCell);

    var periodeCell = document.createElement('th');
    periodeCell.textContent =bigHeaders[1];
    periodeCell.setAttribute('colspan', '3');

    bigHeaderRow.appendChild(periodeCell);

    // Crée une cellule "Week end" pour les deux derniers jours
    var weekCell = document.createElement('th');
    weekCell.textContent = bigHeaders[2];
    weekCell.setAttribute('colspan', '4');
    bigHeaderRow.appendChild(weekCell);

    var headerRow = document.createElement('tr');

    for (var i = 0; i < headers.length; i++) {
        var headerCell = document.createElement('th');
        headerCell.textContent = headers[i];
        headerRow.appendChild(headerCell);
    }
    table.appendChild(bigHeaderRow);
    table.appendChild(headerRow);
    document.body.appendChild(table);
}
addStylesToDocument();
// Fonction pour effacer le tableau
function clearTable() {
    var table = document.querySelector('table');
    if (table) {
        table.remove();
    }
}
const updateVipPlus = async(guild) =>{
    await fs.writeFile(filePath, JSON.stringify(database));
        if (!database[guild.id] || !database[guild.id]["vipPlus"] || !database[guild.id]["vipPlus"].length){
            console.log("Could not update vip + ... no vip + role setted")
            return;
        }
        if (!database[guild.id] || !database[guild.id]["players"]){
            console.log("Could not update vip + ... no players")
            return;
        }
        if (!database[guild.id].vipkey){
            console.log("Could not update vip + ... no vipkey")
            return;
        }
        if (!database[guild.id].currentWeek){
            const date = new Date();
            database[guild.id].currentWeek = {
                timestamp:date.getTime(),
                date: date.toLocaleDateString()
            }
        }
        // reset for everyone

        const timestampReference = database[guild.id].currentWeek.timestamp;

        database[guild.id]["vipPlus"] = database[guild.id]["vipPlus"].sort((a,b)=> b.palier-a.palier);
        const vipkey = database[guild.id].vipkey;
        const players = database[guild.id]["players"];
        for (let playerId in players){
            const player = players[playerId];
            
            let totalWeekVipBet = 0;
            for (const bet of player.bets){
                if (bet.code === vipkey && bet.timestamp >timestampReference ){
                    totalWeekVipBet += bet.bet;
                }
            }
            player.vip = false;
            player.totalWeekVipBet = totalWeekVipBet;
        }
        for (const vip of database[guild.id]["vipPlus"]){
            for (let playerId in players){
                const player = players[playerId];
                if (!player.vipPlus && player.totalWeekVipBet >= vip.palier){
                    player.vipPlus = vip;
                }
            }
        }
        await fs.writeFile(filePath, JSON.stringify(database));
    
}
const updateVip = async(guild) =>{
    await fs.writeFile(filePath, JSON.stringify(database));
        if (!database[guild.id] || !database[guild.id]["vips"] || !database[guild.id]["vips"].length){
            console.log("Could not update vip ... no vip role setted")
            return;
        }
        if (!database[guild.id] || !database[guild.id]["players"]){
            console.log("Could not update vip ... no players")
            return;
        }
        if (!database[guild.id].vipkey){
            console.log("Could not update vip ... no vipkey")
            return;
        }
        if (!database[guild.id].currentWeek){
            const date = new Date();
            database[guild.id].currentWeek = {
                timestamp:date.getTime(),
                date: date.toLocaleDateString()
            }
        }
        // reset for everyone

        const timestampReference = database[guild.id].currentWeek.timestamp;

        database[guild.id]["vips"] = database[guild.id]["vips"].sort((a,b)=> b.palier-a.palier);
        const vipkey = database[guild.id].vipkey;
        const players = database[guild.id]["players"];
        for (let playerId in players){
            const player = players[playerId];
            
            let totalWeekVipBet = 0;
            for (const bet of player.bets){
                if (bet.code === vipkey && bet.timestamp >timestampReference ){
                    totalWeekVipBet += bet.bet;
                }
            }
            player.vip = false;
            player.totalWeekVipBet = totalWeekVipBet;
        }
        for (const vip of database[guild.id]["vips"]){
            const roleName = vip.name;
            let role = guild.roles.cache.find((r) => r.name === roleName);
            if (!role){
                role = await guild.roles.create({
                    name:vip.name
                })
            }
            for (let playerId in players){
                const player = players[playerId];
                const member = await guild.members.fetch(playerId);
                if (!member){
                    continue;
                }
                if (!player.vip && player.totalWeekVipBet >= vip.palier){
                    player.vip = vip;    
                    await member.roles.add(role);
                }
                else{
                    await member.roles.remove(role);
                }
            }
        }
        await fs.writeFile(filePath, JSON.stringify(database));
    
}
function createDataLdb(guildId){
    const tableData = [];
    let serverData = database[guildId];
    if (!serverData){
        database[guildId] = {};
    }
    serverData = database[guildId];
    let periodData = serverData.currentPeriod;
    let weekData = serverData.currentWeek;
    let currentDate = new Date(1694615297732);
    if (!periodData){
        periodData = {};
        periodData.timestamp = currentDate.getTime();
        periodData.date = currentDate.toLocaleDateString()
        serverData.currentPeriod =periodData;
    }
    if (!weekData){
        weekData = {}
        weekData.timestamp = currentDate.getTime();
        weekData.date = currentDate.toLocaleDateString()
        serverData.currentWeek = weekData
    }
    if (!serverData.players){
        return "error no players"
    }

    for (let playerId in serverData.players){
        const player = serverData.players[playerId];
        const playerName = player.username;
        let totalWeekNbBet = 0;
        let totalWeekBet = 0;
        let totalWeekProfit = 0;
        let totalPeriodNbBet = 0;
        let totalPeriodBet = 0;
        let totalPeriodProfit = 0;
        for (const bet of player.bets){
            const timestamp = bet.timestamp;
            if (timestamp < periodData.timestamp){
                continue;
            }
            if (timestamp >= periodData.timestamp){
                totalPeriodNbBet +=1;
                totalPeriodProfit += Number(bet.profit);
                totalPeriodBet += Number(bet.bet);
            }
            if (timestamp >= weekData.timestamp){
                totalWeekNbBet +=1;
                totalWeekProfit += Number(bet.profit);
                if (database[guildId].vipkey && database[guildId].vipkey === bet.code){
                    totalWeekBet += Number(bet.bet);
                }
            }
            
            if (player.benefits){

                for (const benefit of player.benefits){
                    
                    if (benefit.timestamp >= weekData.timestamp){
                        totalWeekProfit += benefit.benefit
                    }
                }
            }
        }
        let totalVipPlusBonus = 0;
        if (player.vipPlus && database[guildId].vipPlus && !player.isCroupier){
            let bonus = 0;
            let remainderVip = totalWeekBet;
            for (const vip of database[guildId].vipPlus){
                if (remainderVip <= vip.palier){
                    continue;
                }
                const remainderPalier = remainderVip-vip.palier;
                console.log(remainderPalier);
                bonus += remainderPalier * vip.value;
                remainderVip = vip.palier;
            }
            totalVipPlusBonus = [bonus,`
            background-color: ${player.vip.color};`];
            totalWeekProfit += totalVipPlusBonus[0];
        }
        else if(player.isCroupier){
            
            totalVipPlusBonus =["n.a","background-color: orange;"];
        }
        if (totalPeriodNbBet){
            tableData.push([playerName,totalPeriodNbBet,totalPeriodBet,totalPeriodProfit,totalWeekNbBet,totalWeekBet,totalVipPlusBonus,totalWeekProfit])
        }
    }

    return tableData.sort((a,b) => b[5] - a[5]);
}

function createDataCroupier(guildId,date){
    
    const tableData = [];
    let serverData = database[guildId];
    if (!serverData){
        database[guildId] = {};
    }
    serverData = database[guildId];
    let periodData = serverData.currentPeriod;
    let weekData = serverData.currentWeek;
    let currentDate = new Date(1694615297732);
    if (!periodData){
        periodData = {};
        periodData.timestamp = currentDate.getTime();
        periodData.date = currentDate.toLocaleDateString()
        serverData.currentPeriod =periodData;
    }
    if (!weekData){
        weekData = {}
        weekData.timestamp = currentDate.getTime();
        weekData.date = currentDate.toLocaleDateString()
        serverData.currentWeek = weekData
    }
    if (!serverData.players){
        return "error no players"
    }
        for (let playerId in serverData.players){
            const player = serverData.players[playerId];
            if (!player.isCroupier){
                continue;
            }
            let lineData = date == "period" ? ["name",0,0,0,0,0,0,0,0] : ["name",0];
            const playerName = player.username;
            for (const bet of player.bets){
                if (!bet.croupierBenefit){
                    continue;
                }
                const timestamp = bet.timestamp;
                if (timestamp >= periodData.timestamp && date == "period"){
                    lineData[1] += Number(bet.croupierBenefit);
                }
                else if (timestamp - date.getTime() >= 0){
                    timestamp - date.Getime() / 86400000;
                    const quotient = parseInt(Math.floor(dividende / diviseur));
                    if (quotient > 6){
                        continue;
                    }
                    lineData[quotient + 1] += Number(bet.croupierBenefit);
                    lineData[8] += Number(bet.croupierBenefit);
                }
            }
            tableData.push(lineData);
        }
    

    return date == "period" ? tableData.sort((a,b) => b[1] - a[1]) : tableDatatableData.sort((a,b) => b[8] - a[8])
}
function addDataToCroupierTable(data) {

    // Récupère le tableau
    var table = document.querySelector('table');

    // Crée une ligne pour chaque ensemble de données
    for (var i = 0; i < data.length; i++) {
        var rowData = data[i];
        var row = document.createElement('tr');

        for (var j = 0; j < rowData.length; j++) {
            var cell = document.createElement('td');
            if (rowData[j].length && Array.isArray(rowData[j])){
                
                cell.textContent = rowData[j][0];
                cell.style.cssText = rowData[j][1];
            }
            else{
                cell.textContent = rowData[j];
            }
            row.appendChild(cell);
        }

        // Ajoute la ligne au tableau
        table.appendChild(row);
    }
}
// Fonction pour ajouter des données au tableau
function addDataToTable(bigHeaders,headers,data) {
    // Efface d'abord le tableau existant
    clearTable();

    // Recrée le tableau
    createDoubleTable(bigHeaders,headers);

    // Récupère le tableau
    var table = document.querySelector('table');

    // Crée une ligne pour chaque ensemble de données
    for (var i = 0; i < data.length; i++) {
        var rowData = data[i];
        var row = document.createElement('tr');

        for (var j = 0; j < rowData.length; j++) {
            var cell = document.createElement('td');
            if (rowData[j].length && Array.isArray(rowData[j])){
                
                cell.textContent = rowData[j][0];
                cell.style.cssText = rowData[j][1];
            }
            else{
                cell.textContent = rowData[j];
            }
            row.appendChild(cell);
        }

        // Ajoute la ligne au tableau
        table.appendChild(row);
    }
}
const bigHeaders = ["Serveur", "AllTime", "Semaine"];
const headers = ["Nom du Joueur","Nombres de Mises"," Montant mise"," Benefice/Perte", "Nombres de mises","Montant VIP+ paliers","Gain VIP+", "Benefice/Perte"];
screenshotHtml = async (htmlContent) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent);
  await page.screenshot({ path: 'tableau.png' });

  await browser.close();
};

// Create a new Discord client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution
  ],
});
const TOKEN = 'MTE1MTQ1OTQyMzU1MDcwNTY5NA.GPjdIv.mmG7YWExlo_zb0_Yq25X2XF5Y7a3VeOHm_oB4U';
const pingRegex = /<@(\d+)>/g;;
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    await sleep(1000);
    if (database[message.guildId]){
        database[message.guildId] = {};
    }
    const adminAuthorized = message.guild.ownerID === message.author.id || message.member.roles.find(role => role.name === database[message.guildId].adminRole);
    if (message.author.id == '294882584201003009' && message.embeds.length && message.embeds[0].title){
        const title = message.embeds[0].title;
        const splitted = title.split(/\s+/);
        const matches = pingRegex.exec(message.embeds[0].data.description);
        if (splitted.length != 2){
            await message.delete();
            if (matches && matches.length ){
                await sleep(1000);
                message.channel.send(matches[0] + " Fréro tu peux bien marquer le titre de ton gstart avec 2 mots stp?");
            }
        }
        else if(!database[message.guildId] || !database[message.guildId].codes || !database[message.guildId].codes[splitted[0]]){
            await message.delete();
            if (!!database[message.guildId]){
                database[message.guildId] = {};
            }
            if (matches && matches.length ){
                await sleep(1000);
            message.channel.send(matches[0] + `Fréro le code ${splitted[0]} n'existe pas, utilise !createcode pour le créer`);
            }
            else{
                message.channel.send(`Fréro le code ${splitted[0]} n'existe pas, utilise !createcode pour le créer`);
            }
        }
        else if(isNaN(Number(splitted[1]))){
            await message.delete();

            if (matches && matches.length ){
                await sleep(1000);
                message.channel.send(matches[0] + " Fréro tu peux bien marquer le titre de ton gstart avec un nombre en deuxième mot stp?");
            }
        }
        
    }

    const isCommand = message.content[0] == '!';
    const args = message.content.match(/"[^"]+"|\S+/g);
    if (!args){
        return;
    }
    // Supprimer les guillemets des arguments entre guillemets
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('"') && args[i].endsWith('"')) {
        args[i] = args[i].slice(1, -1); // Retire les guillemets doubles
      }
    }
    if (!isCommand || !args.length){
        return;
    }
    // switch on command
    switch(args[0]){
        case "!createwhite":
        case "!createwhitecode":
        case "!createwhitekey":
            if (args.length != 2){
                message.reply("La commande '!createwhitecode' ne prend que 1 arguments");
                return;
            }
            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            if (!database[message.guildId]["whiteCodes"]){
                database[message.guildId]["whiteCodes"] = [] 
            }
            database[message.guildId]["whiteCodes"].push(args[1]);
            await fs.writeFile(filePath, JSON.stringify(database));
            message.reply(`White code ${args[1]} crée`);
            break;
        case "!removewhite":
        case "!removewhitekey":
        case "!removewhitecode":
            
            if (args.length != 2){
                message.reply("La commande !removewhitecode ne prend que 1 arguments (i.e la clé du white code)");
                return;
            }
            if (database[message.guildId] && database[message.guildId]["whiteCodes"]){
                database[message.guildId]["whiteCodes"][args[1]] = database[message.guildId]["whiteCodes"][args[1]].filter(value => value != args[1]);
            }
            await fs.writeFile(filePath, JSON.stringify(database));
            message.reply(`Le code ${args[1]} a bien été supprimé`);
            break;
        case "!whitelist":
        case "!whitecodelist":
            
                if (!database[message.guildId] || !database[message.guildId]["whiteCodes"] || !database[message.guildId]["whiteCodes"].length){
                    message.reply("Il n'y a actuellement pas de white code sur le serveur ... merci d'en crée avec !createwhitecode");
                    return;
                }
                else{
                    let lines = "Les white codes du serveur sont : \n"
                    for (const code of database[message.guildId]["whiteCodes"]){
                        lines += `code ${code}\n `;
                    }
                    message.reply(lines);
                    return;
                }
                break;
        case "!help":
            message.reply(`
!help: Affiche l'aide.
!removebet: Enleve un giveway non voulu. S'utilise avec 1 argument : l'id du giveaway.
!editbet: Edit un giveaway mal renseigné. S'utilise avec 3 arguments : l'id du giveaway, le nouveau code du giveaway, la mise du giveaway.
!createwhitecode: Crée un code que le bot ne va pas prendre en compte. S'utilise avec 1 argument, le code.
!removewhitecode: Enlève un code que le bot ne va pas prendre en compte. S'utilise avec 1 argument, le code à enlever.
!vipkey: Renseigne quel est le code vip. S'utilise avec 1 argument, le code à transformer en code VIP. Il n'y en a qu'un seul.
!whitelist : Affiche la liste des codes
!ldb: Affiche le leaderboard sous forme de tableau en .png.
!statscroupier: Affiche les stats du croupier. S'utilise avec une date au format dd/mm/aaaa ou le mot "period"
!resetperiod: Reset la période dans le leaderboard. S'utilise avec une date au format dd/mm/aaaa ou le mot "now".
!resetweek: Reset la semaine dans le leaderboard. S'utilise avec une date au format dd/mm/aaaa ou le mot "now".
!createcode: Crée le code du giveaway. S'utilise avec 2 arguments, la clé puis la valeur entre 0 et 1.
!removecode: Enleve le code du giveway. S'utilise avec 1 argument, la clé à enlever.
!codelist: Affiche la liste des codes.
!createvipplus: Crée un rôle VIP+. S'utilise avec 4 arguments, le nom du rôle VIP+ entre "" , la valeur entre 0 et 1 du %, le palier du vipplus, la couleur du vipplus sur le tableau en hexadecimal
!removevipplus: Enlève un role VIP+. S'tuilise avec 1 argument, le nom du rôle VIP+ entre ""
!vippluslist: Affiche la liste des rôles VIP+.
!createvip: Crée un rôle discord VIP. S'utilise avec 2 arguments, le nom du rôle VIP entre "", le palier du vip.
!removevip: Enlève un rôle VIP. S'utilise avec 1 argument, le nom du rôle VIP entre "".
!viplist: Affiche la liste des rôles VIP.
!createviproom: Crée la catéroy et les channels pour les VIP. Pour les gains bonus de VIP.
!deleteviproom: Delete les channels crée avec !createviproom.
`)
            break;
        case "!vipcode":
        case "!vipkey":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!vipkey' ne prend que 1 argument : la clé du code VIP");
                return;
            }
            if(!database[message.guildId] || !database[message.guildId].codes || !database[message.guildId].codes[args[1]]){
                message.reply(`Fréro le code ${args[1]} n'existe pas, utilise !createcode pour le créer`);
                return;
            }
            database[message.guildId]["vipkey"] = args[1];
            await updateVipPlus(message.guild);
            await updateVip(message.guild);
            message.reply(`Le code ${args[1]} a bien été set comme étant le code VIP`);
            
            break;
        case "!editbet":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 4){
                message.reply("La commande '!editbet' ne prend que 3 arguments : l'id du bet | le code | la mise")
                return;
            }
            if (isNaN(Number(args[1]))){
                message.reply("L'argument 1 doit être l'id du bet !")
                return;
            }
            else if(!database[message.guildId] || !database[message.guildId].codes || !database[message.guildId].codes[args[2]]){
                message.reply(`Fréro le code ${args[2]} n'existe pas, utilise !createcode pour le créer`);
                return;
            }
            else if (isNaN(Number(args[3]))){
                message.reply("L'argument 3 doit être la mise !")
                return;
            }
            else if (!database[message.guildId] || !database[message.guildId].players){
                message.reply("Il n'y a pas encore un seul giveaway de fait!")
                return;
            }
            const code = args[2];
            const codeValuee = database[message.guildId].codes[code];
            const codePercentage = 1.0/(1.0-codeValuee);
            const totalProfit = Number(args[3]); 
            const totalMise = Math.round(Number(totalProfit* codePercentage * 100)/100);
            let y = 0;
            for (let playerId in database[message.guildId].players){
                const player = database[message.guildId].players[playerId];
                if (player.bets){
                    const bet = player.bets.find(bet => bet.betId == args[1]);
                    if (!bet){
                        continue;
                    }
                    
                    const nbEntries = Number(bet.nbWinners) + Number(bet.nbLosers)
                    const unitaryBet = totalMise/nbEntries;
                    const unitaryProfit = totalProfit/bet.nbWinners -unitaryBet;
                    bet.codeValue = codeValuee;
                    bet.code = code;
                    bet.bet = unitaryBet;
                    bet.profit = bet.win ? unitaryProfit : -unitaryBet;
                    y++;
                }
            }
            if (y === 0){
                message.reply(`Il n'y a pas un seul giveaway avec cet l'id ${args[1]} dans la BDD`);
            }
            else{
                await updateVipPlus(message.guild);
                await updateVip(message.guild);
                message.reply(`Les paris avec l'id ${args[1]} ont bien été update dans la BDD`);
            }
            break;
        case "!removebet":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!removebet' ne prend que 1 argument : l'id du bet")
                return;
            }
            if (isNaN(Number(args[1]))){
                message.reply("L'argument doit être l'id du bet !")
                return;
            }
            if (!database[message.guildId] || !database[message.guildId].players){
                message.reply("Il n'y a pas encore un seul giveaway de fait!")
                return;
            }
            let i = 0;
            for (let playerId in database[message.guildId].players){
                const player = database[message.guildId].players[playerId];
                if (player.bets){
                    const indexToDelete = player.bets.findIndex(bet => bet.betId == args[1]);

                    if (indexToDelete !== -1) {
                        database[message.guildId].players[playerId].bets.splice(indexToDelete, 1);
                        i++;
                    }
                }
            }
            if (i === 0){
                message.reply(`Il n'y a pas un seul giveaway avec cet l'id ${args[1]} dans la BDD`);
            }
            else{
                await updateVipPlus(message.guild);
                await updateVip(message.guild);
                message.reply(`Les paris avec l'id ${args[1]} ont été enlevé de la BDD`);
            }
            break;
        case "!statcroupier":
        case "!statscroupier":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!statscroupier' ne prend que 1 argument, soit la date en format jj/mm/aaaa ou alors 'period' ")
                return;
            }
            if (args[1] == "period"){
                clearTable();
                createTable(["Croupier","Total"]);
            }
            if (datePattern.test(args[1])) {
                clearTable();
                const [day, month, year] = args[1].split('/').map(Number);
                const date = new Date(year, month - 1, day);
                const headers = ["Croupier",args[1]];
                for (let i = 1; i<7;i++){
                    const date2 = new Date(86400000 * i + date.getTime());
                    headers.push(date2.toLocaleDateString());
                }
                createTable(headers);
            } else {
                message.reply("La date n'est pas au format valide jj/mm/aaaa");
                return;
            }

            const dataTable = createDataCroupier(message.guildId,args[1]);
            addDataToCroupierTable(dataTable);
            
        
            const htmlTests = dom.serialize();
            await fs.writeFile('output.html', htmlTests);
                        
            await screenshotHtml(htmlTest);
            const attachmentt = new AttachmentBuilder().setFile('tableau.png');
            message.channel.send({files:[attachmentt]});


            break;
        case "!ldb":
        case "!leaderboard":
            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            const tableData = createDataLdb(message.guildId);
            if (tableData == "error no players"){
                await sleep(1000);
                message.reply("Il n'y a pas encore eu un seul giveaway !");
                return;
            }
            const bigHeaders = [message.guild.name,`Historique à compter du ${database[message.guildId].currentPeriod.date}`, `Semaine du ${database[message.guildId].currentWeek.date}`]

            addDataToTable(bigHeaders,headers,tableData)
        
            const htmlTest = dom.serialize();
            await fs.writeFile('output.html', htmlTest);
                        
            await screenshotHtml(htmlTest);
            const attachment = new AttachmentBuilder().setFile('tableau.png');
            message.channel.send({files:[attachment]});
            break;
        case "!resetperiod":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!resetperiod' ne prend que 1 argument, soit la date en format jj/mm/aaaa ou alors 'now' ")
                return;
            }
            if (args[1] == "now"){

                const date = new Date();
                if (!database[message.guildId]){
                    database[message.guildId] = {}
                }
                database[message.guildId].currentPeriod = {
                    timestamp:date.getTime(),
                    date: date.toLocaleDateString()
                }
                await fs.writeFile(filePath, JSON.stringify(database));
                message.reply("La periode a été reset a la date d'aujourd'hui, à l'heure d'aujourd'hui");
                return;
            }
            if (datePattern.test(args[1])) {
                const [day, month, year] = args[1].split('/').map(Number);
    
                const date = new Date(year, month - 1, day);
                if (!database[message.guildId]){
                    database[message.guildId] = {}
                }
                database[message.guildId].currentPeriod = {
                    timestamp:date.getTime(),
                    date: date.toLocaleDateString()
                }
                await fs.writeFile(filePath, JSON.stringify(database));
                message.reply(`La periode a été reset a la date du ${args[1]}`);
                break;
            } else {
                message.reply("La date n'est pas au format valide jj/mm/aaaa");
                return;
            }
            break;
        case "!resetweek":
            
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!resetweek' ne prend que 1 argument, soit la date en format jj/mm/aaaa ou alors 'now' ")
                return;
            }
            if (args[1] == "now"){

                const date = new Date();
                if (!database[message.guildId]){
                    database[message.guildId] = {}
                }
                database[message.guildId].currentWeek = {
                    timestamp:date.getTime(),
                    date: date.toLocaleDateString()
                }
                await updateVipPlus(message.guild);
                await updateVip(message.guild);
                message.reply("La periode a été reset a la date d'aujourd'hui, à l'heure d'aujourd'hui");
                return;
            }
            if (datePattern.test(args[1])) {
                const [day, month, year] = args[1].split('/').map(Number);
    
                const date = new Date(year, month - 1, day);
                if (!database[message.guildId]){
                    database[message.guildId] = {}
                }
                database[message.guildId].currentWeek = {
                    timestamp:date.getTime(),
                    date: date.toLocaleDateString()
                }
                await updateVipPlus(message.guild);
                await updateVip(message.guild);
                message.reply(`La semaine a été reset a la date du ${args[1]}`);
                return;
            } else {
                message.reply("La date n'est pas au format valide jj/mm/aaaa");
                return;
            }
            break;
        case "!createkey":
        case "!createcode":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 3){
                message.reply("La commande '!createcode' ne prend que 2 arguments");
                return;
            }
            const codeValue = Number(args[2].replace(',','.'));
            if (isNaN(codeValue) || codeValue < 0 || codeValue >=1){
                message.reply("La commande '!createcode' ne peut avoir que une valeur nombre comprise entre 0 inclus et 1 exclus, par exemple 0.05");
                return;
            }
            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            if (!database[message.guildId]["codes"]){
                database[message.guildId]["codes"] = {} 
            }
            database[message.guildId]["codes"][args[1]] = codeValue;
            await fs.writeFile(filePath, JSON.stringify(database));
            message.reply(`Code ${args[1]} avec la valeur ${codeValue} crée`);
            break;
        case "!codelist":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (!database[message.guildId] || !database[message.guildId]["codes"] || !Object.keys(database[message.guildId]["codes"]).length){
                message.reply("Il n'y a actuellement pas de code sur le serveur ... merci d'en crée avec !createcode");
                return;
            }
            else{
                let lines = "Les codes du serveur sont : \n"
                for (let code in database[message.guildId]["codes"]){
                    const codeValue = database[message.guildId]["codes"][code];
                    lines += `${code} : ${codeValue} \n`;
                }
                message.reply(lines);
                return;
            }
            break;
        case "!removecode":
        case "!removekey":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande !removecode ne prend que 1 arguments (i.e la clé du code)");
                return;
            }
            if (database[message.guildId] && database[message.guildId]["codes"]){
                delete database[message.guildId]["codes"][args[1]];
            }
            await fs.writeFile(filePath, JSON.stringify(database));
            message.reply(`Le code ${args[1]} a bien été supprimé`);
            break;
        case "!removevipplus":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande !removevipplus ne prend que 1 arguments (i.e le nom du rôle)");
                return;
            }
            if (database[message.guildId] && database[message.guildId]["vipPlus"]){
                database[message.guildId]["vipPlus"] = database[message.guildId]["vipPlus"].filter(vip => vip.name != args[1]);
            }
            await updateVipPlus(message.guild);
            message.reply(`Le role vip + '${args[1]}' a bien été supprimé`);
            break;
            
        case "!removevip":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande !removevip ne prend que 1 arguments (i.e le nom du rôle)");
                return;
            }
            if (database[message.guildId] && database[message.guildId]["vips"]){
                database[message.guildId]["vips"] = database[message.guildId]["vips"].filter(vip => vip.name != args[1]);
            }
            
            let role = message.guild.roles.cache.find((r) => r.name === args[1]);
            if (role){
                await role.delete();
            }
            await updateVip(message.guild);
            message.reply(`Le role vip '${args[1]}' a bien été supprimé`);
            break;
        case "!createvipplus":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 5){
                message.reply('La commande !createvipplus ne prend que 4 arguments (i.e nom du role | valeur | palier | couleur en hexadécimal). Si le nom du role contient des espaces merci de le noter entre ""');
                return;
            }
            
            const value = Number(args[2].replace(',','.'));
            if (isNaN(value) || value < 0 || value >= 1){
                message.reply("La commande '!createvipplus' ne peut avoir que une valeur nombre supérieur à 0 et inférieur à 1 en 2eme argument");
                return;
            }            
            const palier = Number(args[3].replace(',','.'));
            if (isNaN(palier) || palier < 0){
                message.reply("La commande '!createvipplus' ne peut avoir que une valeur nombre supérieur à 0 en 3eme argument");
                return;
            }
            const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
            if (!hexColorRegex.test(args[4])) {
                message.reply("La commande '!createvipplus' doit avoir en 4eme argument une une couleur en hexadécimal");
                return;
            }
            // Obtenez le serveur (guild) auquel vous souhaitez ajouter le rôle.
            const guild = message.guild;

            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            if(!database[message.guildId].vipPlus){
                database[message.guildId].vipPlus = []
            }
            database[message.guildId].vipPlus = database[message.guildId].vipPlus.filter(vip => vip.name != args[1]);
            database[message.guildId].vipPlus.push({value:value,name:args[1],color:args[4],palier:palier});
            
            await updateVipPlus(guild);
            message.reply(`Le role vip + '${args[1]}' pour la valeur ${value} créé avec succès ! De plus les personnes concernés ont bien eu leurs rôles !`);
            break;
        case "!createvip":
            
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 3){
                message.reply('La commande !createvip ne prend que 2 arguments (i.e nom du role | palier). Si le nom du role contient des espaces merci de le noter entre ""');
                return;
            }
            const palierVip = Number(args[2].replace(',','.'));
            if (isNaN(palier) || palier < 0){
                message.reply("La commande '!createvipplus' ne peut avoir que une valeur nombre supérieur à 0 en 3eme argument");
                return;
            }
            // Obtenez le serveur (guild) auquel vous souhaitez ajouter le rôle.
            const currentGuild = message.guild;

            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            if(!database[message.guildId].vips){
                database[message.guildId].vips = []
            }
            database[message.guildId].vips = database[message.guildId].vips.filter(vip => vip.name != args[1]);
            database[message.guildId].vips.push({name:args[1],palier:palierVip});
            
            await updateVip(currentGuild);
            message.reply(`Le role vip '${args[1]}' pour la palier ${palierVip} créé avec succès ! De plus les personnes concernés ont bien eu leurs rôles !`);
            break;
        case "!vippluslist":
            
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (!database[message.guildId] || !database[message.guildId]["vipPlus"] || !database[message.guildId]["vipPlus"].length){
                message.reply("Il n'y a actuellement pas de role vip sur le serveur ... merci d'en crée avec !createvipplus");
                return;
            }
            else{
                let lines = "Les roles vips + du serveur sont : \n"
                for (const vip of database[message.guildId]["vipPlus"]){
                    lines += `${vip.name} : ${vip.value} | ${vip.palier} \n`;
                }
                message.reply(lines);
                return;
            }
            break;
            
        case "!viplist":
            
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (!database[message.guildId] || !database[message.guildId]["vips"] || !database[message.guildId]["vips"].length){
                message.reply("Il n'y a actuellement pas de role vip sur le serveur ... merci d'en crée avec !createvip");
                return;
            }
            else{
                let lines = "Les roles vips du serveur sont : \n"
                for (const vip of database[message.guildId]["vips"]){
                    lines += `${vip.name} : palier ${vip.palier} \n`;
                }
                message.reply(lines);
                return;
            }
            break;
        case "!createroom":
        case "!createviproom":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            const guildd = message.guild;
        
            // Vérifiez si la catégorie existe déjà
            const existingCategory = guildd.channels.cache.find(channel => channel.type === 'category' && channel.name === vipCategoryName);
        
            // Supprimez la catégorie si elle existe déjà
            if (existingCategory) {
                try {
                    await existingCategory.delete();
                } catch (error) {
                }
            }
        
            const categoryPermissions = [];
            for (const vip of database[guildd.id]["vips"]){
                const roleName = vip.name;
                let role = guildd.roles.cache.find((r) => r.name === roleName);
                if (!role){
                    role = await guildd.roles.create({
                        name:vip.name
                    })
                }
                categoryPermissions.push({
                    id:role.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                })
            }
            const category = await guildd.channels.create({ type: ChannelType.GuildCategory,
                name:vipCategoryName,
            permissionOverwrites:categoryPermissions});
            for (const vip of database[guildd.id]["vips"]){
                const roleName = vip.name;
                let role = guildd.roles.cache.find((r) => r.name === roleName);
                await guildd.channels.create({ type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ], parent: category.id , name:roleName});
            }
            break;
        case "!deleteviproom":
        case "!deleteroom": 
        if (!adminAuthorized){
            message.reply("Cette commande ne peut être utilisé que par un admin");
            return;
        }
        const categoryToDelete = message.guild.channels.cache.find(channel => channel.type === ChannelType.GuildCategory && channel.name === vipCategoryName);
        
        // Supprimez la catégorie si elle existe déjà
        if (categoryToDelete) {
            try {
                await categoryToDelete.delete();
            } catch (error) {
            }
        }
        break;
        case "!createcodebenefit":
        case "!createcodebenefice":
        case "!createkeybenefit":
        case "!createkeybenefice":
        case "!createbenefit":
        case "!createbenefice":
        case "!createbenefitcode":
        case "!createbeneficecode":
        case "!createbenefitkey":
        case "!createbeneficekey":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!createcodebenefit' ne prend que 1 arguments");
                return;
            }
            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            if (!database[message.guildId]["benefitCodes"]){
                database[message.guildId]["benefitCodes"] =[];
            }
            database[message.guildId]["benefitCodes"].push(args[1])
            await fs.writeFile(filePath, JSON.stringify(database));
            message.reply(`Code bénéfice ${args[1]} crée`);
            break;
        case "!removecodebenefit":
        case "!removecodebenefice":
        case "!removekeybenefit":
        case "!removekeybenefice":
            if (!adminAuthorized){
                message.reply("Cette commande ne peut être utilisé que par un admin");
                return;
            }
            if (args.length != 2){
                message.reply("La commande '!removecodebenefit' ne prend que 1 arguments");
                return;
            }
            
            if (!database[message.guildId]){
                database[message.guildId] = {};
            }
            if (!database[message.guildId]["benefitCodes"]){
                database[message.guildId]["benefitCodes"] =[];
            }
            database[message.guildId]["benefitCodes"] =  database[message.guildId]["benefitCodes"].filter(e => e != args[1]);
            
            message.reply(`Code bénéfice ${args[1]} remove`);
            return;
            break;
        case "!benefitlist":
        case "!beneficelist":
            case "!codebenefitlist":
            case "!codebeneficelist":
                case "!keybenefitlist":
                case "!keybeneficelist":
                    if (!adminAuthorized){
                        message.reply("Cette commande ne peut être utilisé que par un admin");
                        return;
                    }
            if (!database[message.guildId] || !database[message.guildId]["benefitCodes"] || !Object.keys(database[message.guildId]["benefitCodes"]).length){
                message.reply("Il n'y a actuellement pas de benefice code sur le serveur ... merci d'en crée avec !createcodebenefice");
                return;
            }
            else{
                let lines = "Les codes bénéfices du serveur sont : \n"
                for (const code of database[message.guildId]["benefitCodes"]){
                    lines += `- ${code}\n`;
                }
                message.reply(lines);
                return;
            }
            break;
        case "!adminrole":
            const ownerID = message.guild.ownerID;
            if (ownerID != message.author.id){
                message.reply("La commande '!adminrole' ne peut être utilisé que par l'owner du discord");
            }
            const adminRole = Number(args[1].replace(',','.'));
            if (isNaN(palier) || palier < 0){
                if(!database[guildId]){
                    database[guildId] = {};
                }      
                database[guildId]["adminRole"] = adminRole;
                message.reply("La commande '!adminrole' ne peut avoir que un seul argument, l'id du role");
                return;
            }
            break;
            
    }
});
const updateDatabase= async (url,guildId,splittedTitle) =>{
    try{

        const idd= url.split('giveaway=')[1];
    
        const jsonUrl = `https://cdn.discordapp.com/attachments/${idd}/giveaway_summary.json`;
    
        const response = await fetch(jsonUrl);
        const summary = await response.json();
        if (!summary.entries || !summary.winners || !summary.giveaway){
            return;
        }
        if (!debug){
            if (summary.entries.length === 1 || summary.winners.length === summary.entries.length){
                return;
            }
        }
        const endDate = new Date(Number(summary.giveaway.end)*1000);
        const endString = endDate.toLocaleDateString();
    
        if(!database[guildId]){
            database[guildId] = {};
        }      
          if(!database[guildId]["players"]){
            database[guildId]["players"] = {};
        }
        const codeValue = Number(database[guildId]?.codes?.[splittedTitle[0]]);
        const totalProfit = Number(splittedTitle[1]);
        const unitaryBet = totalMise/summary.entries.length;
        const unitaryProfit = codeValue ? totalProfit/summary.winners.length -unitaryBet : totalProfit/summary.winners.length;
        if (!codeValue){
            if (!database[guildId]["benefitCodes"]){
                database[guildId]["benefitCodes"] = [];
            }
            const codeBenefit = database[guildId]?.["benefitCodes"].find(code => code == splittedTitle[0]);
            if (codeBenefit){
                for (const winner of summary.winners){
                    if (!database[guildId]["players"][winner.id]){
                        database[guildId]["players"][winner.id]={};
                    }
                        database[guildId]["players"][winner.id].username = winner.username;
                    if (!database[guildId]["players"][winner.id]["benefits"]){
                        database[guildId]["players"][winner.id]["benefits"] = [];
                        
                    }
                    database[guildId]["players"][winner.id]["benefits"].push({
                        timestamp: endDate.getTime(),
                        weekDate: endString,
                        benefit: unitaryProfit,
                        betId: summary.giveaway.id
                    });
                    
                }
            }
            return "error code";
        }

        let  codePercentage = 1.0/(1.0-codeValue);
        const totalMise = Math.round(Number(totalProfit* codePercentage * 100)/100);
        const losers = summary.entries.filter(entry => summary.winners.find(winner=> winner.id !== entry.id));
        

        const hostId = summary.giveaway.host.id;
        
        if(database[guildId]["players"][hostId]){
            database[guildId]["players"][hostId].isCroupier = true;
            database[guildId]["players"][hostId].croupierBenefit = totalMise - totalProfit;
        }
        else{
            database[guildId]["players"][hostId] = summary.giveaway.host;
        }

        for (const winner of summary.winners){
            if (!database[guildId]["players"][winner.id]){
                database[guildId]["players"][winner.id]={};
            }
                database[guildId]["players"][winner.id].username = winner.username;
            if (!database[guildId]["players"][winner.id]["bets"]){
                database[guildId]["players"][winner.id]["bets"] = [];
            }
            database[guildId]["players"][winner.id]["bets"].push({
                timestamp: endDate.getTime(),
                weekDate: endString,
                bet:unitaryBet,
                win:true,
                profit: unitaryProfit,
                betId: summary.giveaway.id,
                nbWinners: summary.winners.length,
                nbLosers:  losers.length,
                codeValue: codeValue,
                code:splittedTitle[0],
                isCroupier: hostId == winner.id
            });
            
        }

        for (const loser of losers){
        
            if (!database[guildId]["players"][loser.id]){
                database[guildId]["players"][loser.id] = {};
            }
            database[guildId]["players"][loser.id].username = loser.username;
            if (!database[guildId]["players"][loser.id]["bets"]){
                database[guildId]["players"][loser.id]["bets"] = [];
            }
            database[guildId]["players"][loser.id]["bets"].push({
                timestamp: endDate.getTime(),
                weekDate: endString,
                bet:unitaryBet,
                win:false,
                profit: -unitaryBet,
                betId: summary.giveaway.id,
                nbWinners: summary.winners.length,
                nbLosers: losers.length,
                codeValue: codeValue,
                code:splittedTitle[0],
                isCroupier: hostId == loser.id
            });
        }
        
          
    }
    catch(e){
        console.error(e);
    }

}
client.on('messageUpdate', async (oldMessage, newMessage) => {
    // This event is triggered when a message is edited
    if (newMessage.author.id == "294882584201003009" && newMessage?.components?.[0]?.components?.[0]?.data?.label == "Giveaway Summary"){

        const url = newMessage.components[0].components[0].data.url;
        const title = newMessage.embeds[0].title;
        const splitted = title.split(/\s+/);
        if (database[guildId] && database[guildId]["whiteCodessplitted"] && database[guildId]["whiteCodessplitted"].includes(splitted[0])){
            return;
        }
        await updateDatabase(url,newMessage.guildId,splitted);
        await updateVipPlus(newMessage.guild);
        await updateVip(newMessage.guild);
    }
  });
client.login(TOKEN);
    
})();