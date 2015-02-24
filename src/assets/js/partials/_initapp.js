//*==========  initapp.js  ==========*/

(function() {
    "use strict";
    /* 
    NOTE: The Trello client library has been included as a Managed Resource.  To include the client library in your own code, you would include jQuery and then

    <script src="https://api.trello.com/1/client.js?key=your_application_key">...

    https://trello.com/1/authorize?key=substitutewithyourapplicationkey&name=MadeByClint+Application&expiration=1day&response_type=token&scope=read,write

    See https://trello.com/docs for a list of available API URLs

    The API development board is at https://trello.com/api

    The &dummy=.js part of the managed resource URL is required per http://doc.jsfiddle.net/basic/introduction.html#add-resources
    */

    var Helpers = (function() {
      var getObjValsFromArr = function(objArr, objProp) {
        var content = [];
        if(objArr.length <= 0) { return false; }
        objArr.map(function(item) {
          content.push(item[objProp]);
        });
        return content;
      };
      return {
        getObjValsFromArr: getObjValsFromArr
      };
    }());

    var Init = (function() {
      var settings = {
        mountId: '#output',
      };
    }());

    var Boards = (function() {
      var settings = {
        mountId: 'boards',
        boardIds: [],
        boards: []
      };
      var getContent = function(callback) {
        Trello.get('members/my/boards', function(boards) {
          callback(boards);
        });
      };
      var buildBoard = function(board) {
        var elWrap = document.createElement('a');
        var el = document.createElement('div');
        var title = document.createElement('h2');
        var classes = [ 'board' ];

        // Create array of boardIds
        settings.boardIds.push(board.id);

        // Build elWrap
        elWrap.href = '#' + board.id;
        elWrap.className = 'board-link';

        // Create arr of classes
        if(board.closed) { 
          classes.push('closed'); 
        }
        el.className = classes.join(' ');
        
        title.textContent = board.name;
        el.appendChild(title);

        elWrap.appendChild(el);

        elWrap.addEventListener('click', function() {
          console.log('clicked', this);
          getBoardCards(this.hash.substring(1));
        });

        var getBoardCards = function(boardId) {
          document.getElementById('cards').innerHTML = '';
          console.log('boardIds', boardId);

          var cardUrl = 'boards/' + boardId + '?cards=all';
          console.log(cardUrl);

          Trello.get(cardUrl, function(cards) {
            console.log('cards', cards);
            cards.cards.map(function(item) {
              document.getElementById('cards').innerHTML += item.name + '<br>';
            });
          });
        };
        
        return elWrap;
      };
      return {
        settings: settings,
        getContent: getContent,
        boards: boards,
        buildBoard: buildBoard
      };
    }());

    var DomTouch = (function() {
      var modify = function(content) {
        console.log('modify', content);
        if(content.length > 0) {
          content.map(function(item) {
            document.getElementById(Boards.settings.mountId).appendChild(Boards.buildBoard(item));
          });
        }
      };
      return {
        modify: modify
      };
    }());

    var onAuthorize = function() {
        updateLoggedIn();
        $("#output").empty();

        Boards.getContent(DomTouch.modify);

        return false;
        
        Trello.members.get("me", function(member){
            $("#fullName").text(member.fullName);
          
            var boardNames = {};
          
            Trello.get("members/my/boards", function(boards) {
                $.each(boards, function(ix, board) {
                  boardNames[board.id] = board.name;
                }); 
              
              return Cards(boardNames);
            });
        

            var Cards = function(boardNames) {
              var $cards = $("<div>")
                  .text("Loading Cards...")
                  .appendTo("#output");
              
              // Output a list of all of the cards that the member 
              // is assigned to
              Trello.get("members/me/cards", function(cards) {
                  $cards.empty();
                  $cards.html("<h2>Cards</h2>");
                  var cardDate, isBoard;
                  $.each(cards, function(ix, card) {
                      cardDate = new Date(card.due);                
                      $("<a>")
                      .attr({href: card.url, target: "trello"})
                      .addClass("card")
                      .html("<p><strong>" + card.name + 
                            "</strong><br>" + cardDate + "<br>" +
                            card.labels.map(function(item) {
                              return item.name;
                            }) + "<br>Board: " + boardNames[card.idBoard] + 
                            "</p>")
                      .appendTo($cards);
                  });  
              });
            };
        });

    };

    var updateLoggedIn = function() {
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);        
    };
        
    var logout = function() {
        Trello.deauthorize();
        updateLoggedIn();
    };
                              
    Trello.authorize({
        interactive:false,
        expiration: "1day",
        success: onAuthorize,
    });

    $("#connectLink")
    .click(function(){
        Trello.authorize({
            type: "popup",
            expiration: "1day",
            success: onAuthorize
        });
    });
        
    $("#disconnect").click(logout);





})();

//*==========  END: initapp.js  ==========*/