(function() {
	angular
	    .module("wastedJSapp")
		.filter('cardFilter', cardFilter);

	angular
	    .module("wastedJSapp")
		.filter('livesCount', livesCount);

	function cardFilter() {
		return function (input) {
			var result = "";
			if(input == "") return "&#x1F0A0"

			switch (input[1]){
				case 'S':
					result = "&#x1F0A";
					break;
				case 'H':
					result = "&#x1F0B";
					break;
				case 'C':
					result = "&#x1F0D";
					break;
				case 'D':
					result = "&#x1F0C";
					break;
				default:
					result = "&#1F0A0";
			}

			switch(input[0]){
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
					result += input[0];
					break;
				case 'Q':
					result += "D";
					break;
				case 'J':
					result += "B";
					break;
				case 'K':
					result += "E";
					break;
				case 'A':
					result += "1";
					break;
				default:
					break;
			}

			return result;
		};
	};

	function livesCount() {
		return function(n) {
			var res = [];
			for (var i = 0; i < n; i++) {
				res.push(i);
			}
			return res;
		};
	};
})();
