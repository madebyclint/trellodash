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

    var Init = (function() {
      var settings = {
        mountId: '#output',
        listCache: {},
        cardCache: {},
        lastClicked: {}
      };

      return {
        settings: settings
      };
    }());

    var Helpers = (function() {
      var buildLink = function(item, className) {
        var elWrap = document.createElement('a');
        var el = document.createElement('div');
        var title = document.createElement('h2');
        var classes = [ className ];
        // var isAllLink = (className === 'all' ? true : false);

        // Build elWrap
        elWrap.href = '#' + item.id;
        elWrap.className = className + '-link';

        // Create arr of classes
        if(item.closed) { 
          classes.push('closed'); 
        }
        // Append classes to element
        el.className = classes.join(' ');
        
        title.textContent = item.name;
        el.appendChild(title);

        elWrap.appendChild(el);
        
        return elWrap;
      };
      var getObjValsFromArr = function(objArr, objProp) {
        var content = [];
        if(objArr.length <= 0) { return false; }
        objArr.map(function(item) {
          content.push(item[objProp]);
        });
        return content;
      };
      return {
        buildLink: buildLink,
        getObjValsFromArr: getObjValsFromArr
      };
    }());

    var EventBinders = (function() {
      var clicked = function(el, callback, arg) {
        el.addEventListener('click', function(e) {
          var lastClicked = Init.settings.lastClicked;
          var classes = [];
          var $self = this;
          if(Object.keys(lastClicked).length) {
            classes = Init.settings.lastClicked.className.split(' ');
            classes.splice(classes.indexOf('active'));
            lastClicked.className = classes.join(' ');
          }
          classes = $self.className.split(' ');
          classes.push('active');
          $self.className = classes.join(' ');
          Init.settings.lastClicked = $self;

          callback(arg);
        });
      };

      return {
        clicked: clicked
      };
    }());

    var Boards = (function() {
      var getBoards = function() {
        Trello.get('members/my/boards', function(boards) {
          buildBoards(boards);
        });
      };
      var buildBoards = function(boards) {
        if(boards.length >= 0) {
          var boardLink,
              allBoardsLink,
              boardsIds = [],
              boardsId = document.getElementById('boards'),
              listsId = document.getElementById('lists'),
              cardsId = document.getElementById('cards');
          boardsId.innerHTML = '';
          listsId.innerHTML = '';
          cardsId.innerHTML = '';

          // Create list of boards
          boards.map(function(board) {
            boardsIds.push(board.id);
            boardLink = Helpers.buildLink(board, 'board');
            boardsId.appendChild(boardLink);
            EventBinders.clicked(boardLink, Lists.getLists, board.id);
          });

          // Create All link
          allBoardsLink = '<a href="#all" class="allLink"><div class="board"><h2>All Boards</h2></div></a>';
          boardsId.innerHTML = allBoardsLink + boardsId.innerHTML;
          EventBinders.clicked(document.querySelector('.allLink'), AllItems.getAll, boardsIds);
        }
      };
      return {
        getBoards: getBoards
      };
    }());

    var AllItems = (function() {
      var getAll = function(boardsIds) {
        var getUrls = [];
        var allcards = [];
        boardsIds.map(function(item) {
            // getUrls.push('/boards/' + item + '?lists=all');
            getUrls.push('/boards/' + item + '?cards=all');
          // Trello.get('boards/' + boardId + '?lists=all&cards=all', function(lists) {
          //   console.log('api called');
          //   buildLists(lists);
          //   listCache[boardId] = lists;
          // });
        });
        var batchUrl = 'batch/?urls=' + getUrls.join(',');
        var cardsId = document.getElementById('cards');
        cardsId.innerHTML = '';
        Trello.get(batchUrl, function(batch) {
          batch.map(function(item) {
            Array.prototype.push.apply(allcards, buildCards(item[200]));
          });
          allcards.map(function(item) {
            cardsId.appendChild(item);
          });
        });
      };
      var buildCards = function(board) {
        var cards = board.cards;
        if(cards.length >= 0) {
          var cardLinks = [];
          cards.map(function(card) {
            cardLinks.push(Helpers.buildLink(card, 'card'));
          });
          // cardsId.appendChild(cardLink);
          //   EventBinders.clicked(cardLink, Cards.getCards, card.id);
          return cardLinks;
        }
      };

      return {
        getAll: getAll
      };
    }());

    var Lists = (function() {
      var getListsByBoard = function(boardId) {
        var listCache = Init.settings.listCache;
        if(Object.keys(listCache).length > 0) {
          for(var key in listCache) {
            if(boardId === key) {
              console.log('lists already loaded');
              // Should also cache these node builds in memory
              buildLists(listCache[key]);
              return false;
            }
          }
        }
        Trello.get('boards/' + boardId + '?lists=all', function(lists) {
          console.log('api called');
          buildLists(lists);
          listCache[boardId] = lists;
        });
      };
      var buildLists = function(lists) {
        lists = lists.lists;
        if(lists.length >= 0) {
          var listLink, 
              listsId = document.getElementById('lists'),
              cardsId = document.getElementById('cards');
          listsId.innerHTML = '';
          // cardsId.innerHTML = '';
          lists.map(function(list) {
            listLink = Helpers.buildLink(list, 'list');
            listsId.appendChild(listLink);
            EventBinders.clicked(listLink, Cards.getCards, list.id);
          });
        }
      };
      return {
        getLists: getListsByBoard
      };
    }());

    var Cards = (function() {
      var getCardsByList = function(listId) {
        var cardCache = Init.settings.cardCache;
        if(Object.keys(cardCache).length > 0) {
          for(var key in cardCache) {
            if(listId === key) {
              console.log('cards already loaded');
              // Should also cache these node builds in memory
              buildCards(cardCache[key]);
              return false;
            }
          }
        }
        Trello.get('lists/' + listId + '?cards=all', function(cards) {
          console.log('api called');
          buildCards(cards);
          cardCache[listId] = cards;
        });
      };
      var buildCards = function(cards) {
        cards = cards.cards;
        if(cards.length >= 0) {
          var cardLink, cardsId = document.getElementById('cards');
          cardsId.innerHTML = '';
          cards.map(function(card) {
            cardLink = Helpers.buildLink(card, 'card');
            cardsId.appendChild(cardLink);
            EventBinders.clicked(cardLink, Cards.getCards, card.id);
          });
        }
      };
      return {
        getCards: getCardsByList
      };
    }());

    var DomTouch = (function() {
    }());







    var onAuthorize = function() {
        updateLoggedIn();
        $("#output").empty();

        Boards.getBoards();

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