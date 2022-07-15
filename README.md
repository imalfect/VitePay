# VitePay 
  
 VitePay is a payment system made for Vite Network 
  
  
 # Setup 
  
 1. Create a VitePay SQL Database using the dump provided 
  
 2. Copy the .env.example file as .env and edit details 
  
 3. Replace the public reCaptcha key with yours in the registerMerchant html file 
  
 4. Do "npm start" in order to run the webserver 
  
 5. Visit the webserver 
  
 6. You're all set! Check the documentation located at the docs tab in the header! 
  
 # FAQ 
  
  
 ## Q: What is the css column in the merchant table? 
 A: It's a little thing I've added, you can put any css properties in and the merchant name on the pay page will be displayed with these, use gradient texts, animate them, get creative!
 
 ## Q: How do I verify merchants? (blue tick next to the name)
 
 A: It's simple: just change the "verified" column on the merchant row to "true"
 
 ## Q: Can you explain the process of VitePay transaction?
 
 A: 
 1. merchants create transactions via API, each TX has a unique Vite address created as an "escrow" or "middleman" address.

  2. user can be directed to a unique payment portal with payment instructions and a countdown timer 

  3. user must send correct amount to the middleman address before the transaction expires 
 
  4. once enough confirmations on middleman address, TX is considered processed and funds are send to the merchant's address (no need to wait for confirmations on this end)
  
 ## Q: I don't understand the tables in the database, can you explain?
 
 A: Check the knowledge folder in the repository, these tables are explained there!
 
 ## Q: Can you explain the .env file variables?
 
 A: Descriptions of these that you may not understand are commented in the .env file next to them.
 
