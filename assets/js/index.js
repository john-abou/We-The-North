// Define the global variables.
let upcomingGamesElement = $("#upcoming-games");
let selectedTeam = $(".dropdown-menu li");
let playerStatsElement = $("#player-stats");
let recentGamesElement = $("#recent-stats");
let selectButton = $("#dropdownMenuButton1");
const clientID = "MzE3MTIzMTB8MTY3NTE4OTk3My4zMjk3Nw";
const clientAppSecret = "dd20d1dc80a7a92527e18689f8e60bce450670b200b5f20c21ab540c556a433b";

var players = {
    "Luka Doncic": 132,
    "Nikola Jokic": 246,
    "Joel Embiid": 145,
    "Giannis Antetokounmpo": 15,
    "LeBron James": 237,
}

// Gets a team ID from the balldontlie teams endpoint
// The team ID is used to get a list of games with the team ID from the games endpoint.
function getTeamID(teamName) {
    selectButton.text(teamName);
    let queryURL = "https://www.balldontlie.io/api/v1/teams";
    fetch(queryURL)
        .then(function(response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data) {
            let teamsObject = data['data'];
            for (let i = 0; i < teamsObject.length; i++) {
                if (teamsObject[i].full_name === teamName) {
                    // Get the team ID from the object
                    let bdlTeamID = teamsObject[i].id;
                    getGameStats(bdlTeamID, teamName);
                    return;
                }
            }
        })
}

// Function to get the top player stats displayed in the aside element (sidebar)
function getPlayerStats() {
    indexPlayers = Object.keys(players);

    for (var i=0; i < indexPlayers.length; i++) {
        (function(i) {
          // Define the query URL
          let avgstatsQueryURL = "https://www.balldontlie.io/api/v1/season_averages?player_ids[]=" + players[indexPlayers[i]] +  "&per_page=100";
      
          fetch(avgstatsQueryURL)
              .then(function(response) {
                  if (!response.ok) {
                      throw response.json();
                  }
                  return response.json();
              })
              .then(function(data) {
                  let playerStats = data['data'];
                  let cardHeader = $('<h5>').text(indexPlayers[i]);
                  let cardBody = $('<p>').text("Points: " + playerStats[0].pts + "\nRebounds: " + playerStats[0].reb + "\nAssists: " + playerStats[0].ast);
                  playerStatsElement.append(cardHeader, cardBody);
              });
        })(i); 
    } 
}

// Function to get the recent game stats and display them in a table.
function getGameStats(teamID, teamName) {
    // Get the games from the balldontlie games endpoint
    let queryURL = "https://www.balldontlie.io/api/v1/games?team_ids[]=" + teamID + "&start_date=2023-01-01&end_date=2023-02-01&per_page=100";
    fetch(queryURL)
        .then(function(response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data) {
            // Get the games from the JSON object
            let gamesObject = data['data'];
            
            // Function to sort the dates of the game
            function custom_sort(a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }    

            // Sort the games by date
            gamesObject.sort( custom_sort ); //returns the array sorted by date in ascendingorder (oldest --> newest game)

            // Create the table            
            let table = $('<table>');
            let tableBody = $('<tbody>');
            let tableHead = $('<thead>');
            let rowHead = $('<tr>');
            let cellDate = $('<td>').text("Date");
            let cellTeam1 = $('<td>').text(teamName);
            let cellTeam2Name = $('<td>').text("Opposing Team");
            let cellTeam2Score = $('<td>').text("Opp. Team Score");
            let cellLocation = $('<td>').text("Venue");

            // Reset the table and append it to the page
            recentGamesElement.empty();
            recentGamesElement.append( table );
            table.append(tableHead);
            tableHead.append(rowHead);
            rowHead.append(cellDate, cellTeam1, cellTeam2Name, cellTeam2Score, cellLocation);
            table.append( tableBody );

            // Loop through the games and add them to the table
            for (let game = 0; game < gamesObject.length; game++) {
                let gameDate = gamesObject[game].date;
                let formattedGameDate = dayjs(gameDate).format("ddd, MMM D");
                let location = gamesObject[game]['home_team'].city;

                // Create the table row and append it to the table body
                let rowData = $('<tr>').attr("class", "row" + game);
                tableBody.append(rowData);

                // Create the table cells and append them to the table row
                let rowDataDate = $('<td>').text(formattedGameDate);
                let rowDataLocation = $('<td>').text(location);

                // Check if the selected team is the home team or the away team. Assign the team names and scores accordingly.
                if (gamesObject[game]['home_team'].full_name == teamName) {
                    let team1Score = gamesObject[game].home_team_score;
                    let team2Name = gamesObject[game]['visitor_team'].full_name;
                    let team2Score = gamesObject[game].visitor_team_score;
                    let rowDataTeam1 = $('<td>').text(team1Score);
                    let rowDataTeam2Name = $('<td>').text(team2Name);
                    let rowDataTeam2Score = $('<td>').text(team2Score);
                    rowData.append(rowDataDate, rowDataTeam1, rowDataTeam2Name, rowDataTeam2Score, rowDataLocation);
                } else {
                    let team1Score = gamesObject[game].visitor_team_score;
                    let team2Name = gamesObject[game]['home_team'].full_name;
                    let team2Score = gamesObject[game].home_team_score;
                    let rowDataTeam1 = $('<td>').text(team1Score);
                    let rowDataTeam2Name = $('<td>').text(team2Name);
                    let rowDataTeam2Score = $('<td>').text(team2Score);
                    rowData.append(rowDataDate, rowDataTeam1,  rowDataTeam2Name, rowDataTeam2Score, rowDataLocation);
                }
            }
        })
}

// Get the upcoming games from the seat geek API and display them in a table.
function getUpcomingGames(teamName) {
    // Format the query string inputs and define the URL in the call
    let teamSGFormat = teamName.toLowerCase().replaceAll(" ", "-");
    let queryURL = "https://api.seatgeek.com/2/events/?performers.slug=" + teamSGFormat + "&per_page=30&client_id=" + clientID + "&client_secret=" + clientAppSecret;
    fetch(queryURL)
        .then(function(response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data) {
            // Get the upcoming games from the JSON object
            let nbaGames = data['events'];

            // Empty the table and create the table elements
            upcomingGamesElement.empty();
            let table = $('<table>');
            let tableBody = $('<tbody>');
            let tableHead = $('<thead>');
            let rowHead = $('<tr>');
            let cellGameDateTime = $('<td>').text("Date");
            let cellTitle = $('<td>').text("Games");
            let cellVenueLocation = $('<td>').text("Venue");
            let cellBuyTickets = $('<td>').text("Tickets");
            
            // Append the table to the page
            upcomingGamesElement.append( table );
            table.append(tableHead);
            tableHead.append(rowHead);
            rowHead.append(cellGameDateTime, cellTitle, cellVenueLocation, cellBuyTickets);
            table.append( tableBody );

            // Loop through the games and add them to the table
            for (let game = 0; game < nbaGames.length; game++) {
                let gameDate = nbaGames[game].datetime_local;
                let formattedGameDate = dayjs(gameDate).format("MMM D");
                let formattedGameTime = dayjs(gameDate).format("ddd h:mm A");
                let title = nbaGames[game].title;
                let venue = nbaGames[game].venue.name;
                let location = nbaGames[game].venue.address;
                let minPrice = nbaGames[game].stats.lowest_price;
                let ticketURL = nbaGames[game].url;

                let rowData = $('<tr>').attr("class", "row" + game);
                tableBody.append(rowData);

                let rowDataGameDateTime = $('<td>').text(formattedGameDate + " " + formattedGameTime);
                let rowDataTitle = $('<td>').text(title);
                let rowDataVenueLocation = $('<td>').text(venue + " " + location);
                let rowDataBuyTickets = $('<td>').html("<a href=" + ticketURL + " target='_blank'><button>Starting at $"+ minPrice + "</button></a>");

                rowData.append(rowDataGameDateTime, rowDataTitle, rowDataVenueLocation, rowDataBuyTickets);
                }
        })
}

function init() {
    // Display the raptors as the default team
    getPlayerStats();

    // Enter the team ID for the Toronto Raptors to display there recent game stats
    getGameStats(28, "Toronto Raptors");

    // Call the getUpcomingGames function for the Toronto Raptors
    getUpcomingGames("Toronto Raptors");

    // Display the raptors as the default team
    selectButton.text("Toronto Raptors");
}
init();

selectedTeam.click(function(event) {
    // Get the team name from the selected element. Format is correct for balldontlie API.
    let teamName = event.target.text;

    //Call the getTeamID function for the selected team to start the API calls for the season stats
    getTeamID(teamName);

    // Convert the team name to the SeatGeek query sting format
    let teamSGFormat = teamName.toLowerCase().replaceAll(" ", "-");

    // Call the getUpcomingGames function for the selected team
    getUpcomingGames(teamSGFormat);
})