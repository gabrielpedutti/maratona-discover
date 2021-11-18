const Modal = {
    open(){
        //Abrir modal
        //Adicionar a class active ao modal
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close(){
        //Fechar o modal
        //Remover a class active do modal
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction) // Adiciona nova transação 

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        // somar as entradas
        let income = 0;
        // pegar todas as transações
        // para cada transação,
        Transaction.all.forEach(transaction => {
        // se ela for maior que zero
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        // somar a uma variável e retornar a variável
        return income
    },

    expenses(){
        // somar as saídas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },

    total(){
        // entradas - saídas
        return Transaction.incomes() + Transaction.expenses();
    },
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)        
        
        const html = `
        <td class="description">${transaction.description}</td>
        <td class=${CSSclass}>${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "" // Verificando se é menor que 0 e adicionando o sinal de negativo

        value = String(value).replace(/\D/g, "") // Transformando em String e retirando tudo que não for número.

        value = Number(value) / 100 // Transformando o número armazenado no JS sem '.00' em valor considerando os centavos

        value = value.toLocaleString("pt-BR", { // Formatando o valor para moeda (Real).
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // Verificar se todas as informações foram preenchidas
            Form.validateFields()
            // Formatar os dados para salvar
            const transaction = Form.formatValues()
            // Salvar
            Form.saveTransaction(transaction)
            // Apagar os dados do formulário
            Form.clearFields()
            // Modal feche
            Modal.close()
            // Atualizar a aplicação
        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        /*Transaction.all.forEach(function(transaction, index) { // poderia substituir por arrow function "...forEach(transaction => {....)"
            DOM.addTransaction(transaction, index)
            // Seria possível simplificar essa função trocando por:
            // Transaction.all.forEach(DOM.addTransaction)
            // Visto que uma função está chamando outra com os mesmos valores, possibilitando assim um "atalho"
        })*/

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()