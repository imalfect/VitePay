const URL = 'https://localhost:8080/'
let x;
let checkinterval;
let started = false;
/*
    Codes:
        1 - Success
        2 - ID doesn't exist
        400 - SQL Error
        502 - Other Issue
*/

function setDiv(num) {
    const failDiv = document.getElementById('failDiv')
    const loadDiv = document.getElementById('loadDiv')
    const txDiv = document.getElementById('mainDiv')
    const successDiv = document.getElementById('successDiv')
    if (num === 1) {
        loadDiv.style.visibility = 'visible'
        failDiv.style.visibility = 'collapse'
        txDiv.style.visibility = 'collapse'
        successDiv.style.visibility = 'collapse'
    } else if (num === 2) {
        failDiv.style.visibility = 'visible'
        loadDiv.style.visibility = 'collapse'
        txDiv.style.visibility = 'collapse'
        successDiv.style.visibility = 'collapse'
    } else if (num === 3) {
        txDiv.style.visibility = 'visible'
        loadDiv.style.visibility = 'collapse'
        failDiv.style.visibility = 'collapse'
        successDiv.style.visibility = 'collapse'
    } else if (num === 4) {
        successDiv.style.visibility = 'visible'
        loadDiv.style.visibility = 'collapse'
        failDiv.style.visibility = 'collapse'
        txDiv.style.visibility = 'collapse'
    }


}

function countdown(unixTimestamp) {
    started = true
    let countDownDate = new Date(unixTimestamp * 1000).getTime();
    x = setInterval(async function() {

        // Get today's date and time
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        let distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("timeLeft").innerHTML = minutes + ":" + seconds;

        // If the count down is finished, write some text
        if (distance < 0) {
            setTimeout(fetchTransaction(),4000)
        }
    }, 1000);
}

async function fetchTransaction() {
    let parts = window.location.href.split('/');
    const transactionID = parts.pop()

    const transaction = await fetch(`${window.origin}/api/getTransaction`, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            txID:transactionID
        })
    }).then(res => res.json())

    if (transaction.code === 1) {
        // Success (load)
        if (transaction.txCode === 1) {
            // Still alive
            if (transaction.expirationTime === 'never') {
                // Never
                clearInterval(x)
                document.getElementById("timeLeftParent").innerHTML = 'Waiting for confirmations..'
            }
            if (started === false) {
                countdown(parseInt(transaction.expirationTime))
            }
            // Get QR
          /*  const qrurl = await fetch('https://chart.googleapis.com/chart', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'cht': 'qr',
                    'chl': `vite:${transaction.mmAddress}?amount=${transaction.amount / Math.pow(10,transaction.tokenDecimals)}&data=${window.btoa(transaction.memo)}`,
                    'choe': 'UTF=8',
                    "chs": "250x250"
                })
            }).then(res => res.blob())
            let reader = new FileReader();
            reader.readAsDataURL(qrurl);
            reader.onloadend = function() {
                let  base64data = reader.result;
                const qr = document.getElementById('payQR')
                qr.src = base64data
            }*/
            const image = '../img/logo_circle_cut.svg';
            const element = document.getElementById("qrcanvas"); //Element must be an instance of HTMLCanvasElement or HTMLDivElement
            const qrCode = new QrCode.qrcode(element);
            const qrCodeSetting = {
                size: 1500,
                ecLevel: QrCode.ecLevel.QUARTILE,
                minVersion: 10,
                //background: '#007bfe',
                background:'#fff',
                fill:'#007bfe',
                //fill:'#000',
                mode: QrCode.modes.NORMAL,
                radius: 0,
                quiet:2,
                mSize:0.20 ,
            };
            let qrCodeImageUrl = null;

            qrCode.generate(`vite:${transaction.mmAddress}?amount=${transaction.amount / Math.pow(10,transaction.tokenDecimals)}&data=${window.btoa(transaction.memo)}&tti=${transaction.tokenId}`, qrCodeSetting)
                .then(() => {
                    qrCodeImageUrl = qrCode.getImage();
                    document.getElementById('payQR').src = qrCode.getImage()
                });

            if (transaction.confirmations !== undefined) {
                const confirmations = document.getElementById('txConfirmations')
                confirmations.parentElement.style.display = 'block'
                confirmations.innerHTML = transaction.confirmations
            }
            const memo = document.getElementById('txMemo')
            const amount = document.getElementById('txAmount')
            const address = document.getElementById('txAddress')
            const txid = document.getElementById('transactionID')
            const verifiedMark = document.getElementById('verifiedMark')
            const merchantName = document.getElementById('merchantName')
            const txtoken = document.getElementById('txToken')
            const description = document.getElementById('txDescription')
            memo.value = transaction.memo
            amount.value = transaction.amount / Math.pow(10,transaction.tokenDecimals)
            address.value = transaction.mmAddress
            alert(transaction.merchantName)
            merchantName.innerHTML = decodeURIComponent(transaction.merchantName)
            txid.innerHTML = transactionID
            txtoken.innerHTML = transaction.tokenSymbol
            description.innerHTML = decodeURIComponent(transaction.description)


            if (transaction.merchantVerified === 'true') {
                verifiedMark.style.display = 'inline'
            }
            if (checkinterval === undefined) {
                checkinterval = setInterval(async function() {
                    await fetchTransaction()
                },3000)
            }

            setDiv(3)

        } else if (transaction.txCode === 2) {
            // expired
            if (checkinterval !== undefined) {
                const confirmations = document.getElementById('txConfirmations')
                confirmations.parentElement.style.display = 'block'
                clearInterval(checkinterval)
            }

            const label = document.getElementById('failDescription')
            label.innerHTML = 'This transaction has expired!'
            setDiv(2)
        } else if (transaction.txCode === 3) {
                const redirectMerchant = document.getElementById('redirectMerchant')
                redirectMerchant.href = decodeURIComponent(transaction.redirectURL)
                const confirmations = document.getElementById('txConfirmations')
                confirmations.parentElement.style.display = 'block'
                clearInterval(checkinterval)

            setDiv(4)
        }

    } else if (transaction.code === 2) {
        const label = document.getElementById('failDescription')
        label.innerHTML = 'This transaction does not exist!'
    setDiv(2)
    }
}
//  res.json({code:1,memo:transaction[0][0].txMemo,mmAddress:transaction[0][0].mmAddress,amount:transaction[0][0].txAmount,tokenId:transaction[0][0].txToken,txCode:1,expirationTime:transaction[0][0].txDeadline})