function loadKey() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    if (params.key !== undefined) {
        document.getElementById('apiKey').innerHTML = atob(params.key)
    } else {
        window.location.replace('/index.html')
    }

}


async function createMerchant() {

    // Fetch Returning {code:x,key:y}:
    /*
        Codes:
            1 - Success
            2 - Name already taken
            400 - SQL Error
            502 - Other Issue
    */

    let url = window.location.origin
    const captcha = grecaptcha.getResponse()

    const response = await fetch(`${url}/api/createMerchant`, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: `{
            "name": "${document.getElementById('merchantName').value}",
            "captchaResponse":"${captcha}"
        }`
    }).then(res => res.json())

    if (response.code === 1) {
        window.location.replace(`/merchantsuccess.html?key=${btoa(response.key)}`)

    } else if (response.code === 2) {
        grecaptcha.reset();
        alert("This name is already taken!")
    } else if (response.code === 3) {
	grecaptcha.reset();
alert("Captcha isn't completed!");
} else {
        grecaptcha.reset();
        alert("Unexpected error happened.")
    }

}
