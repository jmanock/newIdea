(function(){
  'use strict';

  angular
  .module('newIdea')
  .controller('ProfileController', ProfileController);

  function ProfileController($http, Firebase, FirebaseUrl, $firebaseObject, $stateParams){
    /* TODO
      - Remove players from screen and fb
      - Add players to screen
      - Style
    */
    var vm = this;
    vm.add = add;
    var golfers = [];
    var name;
    var ref = new Firebase(FirebaseUrl);

    init();
    function init(){
      var user = $firebaseObject(ref.child('Users').child($stateParams.id));
      user.$loaded().then(function(){
        name = user.uid;
      });
    }

    $http.get('http://cors.io/?u=http://www.pgatour.com/data/r/current/leaderboard-v2.json')
    .success(function(data){
      var tournamentName = data.leaderboard.tournament_name;
      vm.tName = tournamentName;
      var start = data.leaderboard.players;
      angular.forEach(start, function(a){
        var firstName = a.player_bio.first_name;
        var lastName = a.player_bio.last_name;
        var fullName = firstName +' '+lastName;
        golfers.push(fullName);
      });
      vm.players = golfers;
    });

    function add(golfer){
      /* TODO
        - add players to screen
      */
      if(golfer === 'J.B. Holmes'){
        golfer = 'J B Holmes';
      }
      var userTeam = ref.child('userTeam').child(name).child('Team').child(golfer);
      var teamUser = ref.child('teamUser').child(golfer);
      var index = golfers.indexOf(golfer);

      ref.child('userTeam').child(name).child('Count').transaction(function(count){
        if(count === null){
          count = 0;
        }
        if(count >= 4){
          console.log('Thats all the players you can have on your team');
        }else{
          return(count ||0)+1;
        }
      }, function(err, commited){
        if(err){
          console.log(err);
        }else if(commited){
          userTeam.update({
            Index:index,
            Name:golfer
          });
          teamUser.update({
            name:name,
            golfer:golfer
          });
        }
      });
    }
  }
})();
