const APIKey = "3606391642e84b0e81335d2f1fe8be7a"

class RequestAPI {
  constructor(URL, method = "GET", data = null) {
    this.URL = URL;
    this.data = data;
    this.method = method;

    this.callAPI = this.callAPI.bind(this);

    this.headersData = {
      method: this.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: (this.data != null) ? this.data.news_api_token = APIKey && JSON.stringify(this.data) : null
    };
  }

  async callAPI() {
    return new Promise((resolve, reject) => {
      fetch(this.URL, this.headersData)
        .then(res => {
            if( res.ok ){
                return res.json();
            }
            else{
                return res.json()
                .then( message => reject(message))
            }
        })
        .then(datas => resolve(datas))
        .catch(err => {
            console.log("Il semble qu'il y ait eu une erreur, veuillez nous excusez pour ce léger désagrémengt.");
            return reject(err)
        })
    });
  }
}
