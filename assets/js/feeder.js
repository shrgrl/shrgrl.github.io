// Load a random quote and display on the index page
function loadQuotes(callback) {
  getData('{{ base }}/../assets/json/quotes.json', function (result) {
    const randomNum = Math.floor((Math.random() * Object.keys(result.quotes).length));
    callback("“" + result.quotes[randomNum].text + "”", result.quotes[randomNum].author);
  });
}

// Detect the visitor's location
function loadCountry(callback) {
  getData('https://freegeoip.app/json/', function (result) {
    if (!result || !result.country_name) {
      callback('Hi there, visitor!');
      return;
    }
    var country = result.country_name
    const flag = result.country_code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));

    switch (country) {
      case 'Bahamas':
      case 'Cayman Islands':
      case 'Central African Republic':
      case 'Channel Islands':
      case 'Comoros':
      case 'Czech Republic':
      case 'Dominican Republic':
      case 'Falkland Islands':
      case 'Gambia':
      case 'Isle of Man':
      case 'Ivory Coast':
      case 'Leeward Islands':
      case 'Maldives':
      case 'Marshall Islands':
      case 'Netherlands':
      case 'Netherlands Antilles':
      case 'Philippines':
      case 'Solomon Islands':
      case 'Turks and Caicos Islands':
      case 'Virgin Islands':
        country = 'the ' + flag + ' ' + country;
        break;
      default:
        country = flag + ' ' + country;
        break;
    }
    callback('Hi there, visitor from ' + country + '.');
  });
}

// Load random quote based on the weekday
function loadWeekdayQuotes(callback) {
  getData('{{ base }}/../assets/json/weekdays.json', function (result) {
    var weekday = moment().format('dddd');

    var randomNum = Math.floor((Math.random() * Object.keys(result[weekday.toLowerCase()]).length));
    var quote = result[weekday.toLowerCase()][randomNum]
    var gun ="";
       switch (weekday) {
      case 'Monday':
        gun ='Pazartesi'
        break;
      case 'Tuesday':
        gun ='Salı'
        break;
      case 'Wednesday':
        gun ='Çarşamba'
        break;  
      case 'Thursday':
        gun ='Perşembe'
        break;  
      case 'Friday':
        gun ='Cuma'
        break;  
      case 'Saturday':  
        gun ='Cumartesi'
        break;   
      case 'Sunday':  
        gun ='Pazar'
        break;   

    }
    callback('Bugün ' + gun + 'dir. ' + quote);
  });
}
