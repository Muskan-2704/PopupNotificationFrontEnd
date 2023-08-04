var refreshToken = null;
var accessToken;
const redirectURL = chrome.identity.getRedirectURL(); 
const clientId = "160303188104-lhimaphm0onublk21hkka18b6cnrho4v.apps.googleusercontent.com"; 
const clientSecret = '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';
var authcode;

async function getToken() {
    if(refreshToken == null){
        const authParams = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectURL,
            scope:[
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.readonly'
            ].join(' '),
            access_type: 'offline',
            prompt: 'consent'       
        });    
        const authURL = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`;
        var responseUrl= await chrome.identity.launchWebAuthFlow({ url: authURL, interactive: true });
        const url = new URL(responseUrl);
        const urlParams = new URLSearchParams(url.search.slice(1));
        const params = Object.fromEntries(urlParams.entries());
        authcode = params['code'];
    
        const refresh_data = new URLSearchParams({ 
          code: authcode,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectURL,
          grant_type: 'authorization_code',  
        });
          
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Host': 'oauth2.googleapis.com',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: refresh_data,
        });
        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;
        chrome.storage.local.set({'ftoken': refreshToken});  
      }
    
      else{
        const access_data = new URLSearchParams({ 
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken, 
          grant_type: 'refresh_token', 
        })
        const token_response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Host': 'oauth2.googleapis.com',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: access_data,
        });
        const accessTokenData = await token_response.json();
        accessToken = accessTokenData.access_token;
        chrome.storage.local.set({'ftoken': refreshToken});
      }
      return accessToken;
}

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    if(message ='authorization'){
      chrome.storage.local.get('ftoken', function(result) {
        refreshToken = result.ftoken; 
        getToken().then(sendResponse);
      });
    }
    return true;
});