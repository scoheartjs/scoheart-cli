const get = document.querySelector('#get');
const list = document.querySelector("#list")
const table = document.querySelector('.table');

list.addEventListener("click", function () {
    axios({
        method: "get",
        url: "http://localhost:8081/student"
    }).then(res => {

        res.data.forEach(item => {
            const { name, age, gender, major, grade } = item

            const DOM = `
            <tr>
                <th>${name}</th>
                <th>${age}</th>
                <th>${gender}</th>
                <th>${grade}</th>
                <th>${major}</th>
            </tr>
            `
            table.insertAdjacentHTML("beforeend", DOM)

        })

    })
})

get.addEventListener("click", function () {
    axios({
        method: "get",
        url: "http://localhost:8081/student/1"
    }).then(res => {

        const { name, age, gender, major, grade } = res.data

        const DOM = `
            <tr>
                <th>${name}</th>
                <th>${age}</th>
                <th>${gender}</th>
                <th>${grade}</th>
                <th>${major}</th>
            </tr>
            `
        table.insertAdjacentHTML("beforeend", DOM)

    })
})