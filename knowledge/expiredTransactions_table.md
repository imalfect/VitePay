merchantName => Name of the merchant.

txDescription => Description of the transaction set by the merchant.

txToken => tti_ of the token that's used for the transaction.

txAmount => **Raw** amount of the token expected to be received in this transaction.

txMemo => Memo the user is expected to use when sending the money.

txID => Unique ID for each transaction.

txDestination => vite_ address the mmAddress should send the funds to.

txStatus => 3 => Transaction was successful | 2 => Transaction expired |  4 => Transaction manually cancelled (by the database admin) (most likely won't use it)

#### mmSeed => Encrypted seed of the "middleman" wallet used for this transaction.
#### mmAddress => Wallet address of the "middleman" wallet.