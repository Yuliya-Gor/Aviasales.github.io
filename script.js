const otkuda = document.querySelector('.input__cities-from'),
    dropdowncitiesfrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesto = document.querySelector('.input__cities-to'),
    dropdowncitiesto =document.querySelector('.dropdown__cities-to'),
    inputdatedepart =document.querySelector('.input__date-depart'),
    buttonSearch=document.querySelector('.button__search'),
    formSearch=document.querySelector('.form-search'),
    cheapestTicket=document.getElementById('cheapest-ticket'),
    otherCheapTickets=document.getElementById('other-cheap-tickets'),
    wrapper=document.querySelector('.wrapper__ticket'),
    blockTicket=document.querySelector('.block__ticket'),
    Body=document.getElementsByTagName('body');

    const citiesAPI='http://api.travelpayouts.com/data/ru/cities.json';
    let city = [],
        proxy = 'https://cors-anywhere.herokuapp.com/',
        API_TOKEN='328e1e3dcdade08a422eb046de89c431',
        calendar='http://min-prices.aviasales.ru/calendar_preload',
        Flights = [];

    //создаем объект запроса для соединения с сервером
    const getData =(url, callback, reject = console.error) => {
     
        const request = new XMLHttpRequest();
        request.open('GET', url);
        request.addEventListener('readystatechange', () => {
            if (request.readyState !== 4) return;
            if (request.status === 200) {
                callback(request.response);
            }
            else {
               reject(request.status);
            }
        });
        request.send();
    
    };
    
    
    const showCity =(input, list)=>{
        list.textContent='';
        if ((input.value !==''))
        {
           
            let cityFilt=city.filter((item) => {
                if (item.name)
                {
                    const fItem=item.name.toLowerCase();
                return fItem.startsWith(input.value.toLowerCase());
                }
            });
                cityFilt.forEach((item)=> {
                    const li=document.createElement('li');
                    li.classList.add('dropdown__city');
                    li.textContent=item.name;
                list.append(li);
                });
            }
        
    };
    const selectCity =(input, list) =>{
        const target = event.toElement;
       if (target.tagName.toUpperCase()==='LI')
       {
           input.value= target.textContent;

           list.textContent='';
       }
    };
    const showData =(input)=>{
        input.value=event.target.value;
    }

    const getNameCity=(data) =>{
        const objCity = city.find((item) => item.code===data);
        return objCity.name;
        
    } 

    const getChanges=(num) => {
      if (num){
        return num===1? 'С одной пересадкой' : `С ${num} пересадками`;
      }
      else {return 'Без пересадок';}
  }

    const getDateTime = (date)=>{
        return new Date(date).toLocaleString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getLinkAviasales =(data) => {
        let link ='https://www.aviasales.ru/search/';
         const dateFull=new Date(data.depart_date);
         const date=dateFull.getDate();
         const month=dateFull.getMonth()+1;
        link += data.origin;
        link+=date < 10? '0'+date: date;
        link+=month<10? '0'+month: month;
        link+=data.destination+'1';
        return link;
    };


    const createCard=(elem)=>{
       let ticket=document.createElement('article');
       ticket.classList.add('ticket');
       
       let deep ='';
       if(elem){
           deep=`

           <h3 class="agent">${elem.gate}</h3>
                <div class="ticket__wrapper">
                    <div class="left-side">
                        <a target="_blank" href="${getLinkAviasales(elem)}" class="button button__buy">Купить за ${elem.value} руб</a>
                    </div>
                    <div class="right-side">
                        <div class="block-left">
                            <div class="city__from">Вылет из города
                                <span class="city__name">${getNameCity(elem.origin)}</span>
                            </div>
                            <div class="date"></div>
                        </div>

                        <div class="block-right">
                            <div class="changes">${getChanges(elem.number_of_changes)}</div>
                            <div class="city__to">Город назначения:
                                <span class="city__name">${getNameCity(elem.destination)}</span>
                                <div class="date_department">Дата полета: 
                                    <span class="date_of_depart">${getDateTime(elem.depart_date)}</span>
                           
                                </div>
                        </div>
                    </div>
                </div>
           `;
       }
       else {
           deep='<h3>К сожалению, на указанную дату билетов нет</h3>'
       }
       ticket.insertAdjacentHTML('afterbegin', deep);

        return ticket;

   }

    const renderCheapYear=(cheapTickets, date)=>{
        cheapTickets.sort((a, b)=> {
            if (a.value > b.value) {
              return 1;
            }
            if (a.value < b.value) {
              return -1;
            }
            // a должно быть равным b
            return 0;
        });
       otherCheapTickets.style.display='block';
       otherCheapTickets.innerHTML='<h2>Самые дешевые билеты на другие даты</h2>';
      for (i=0;i<cheapTickets.length && i<10; i++)
       {let ticket = createCard(cheapTickets[i]);
       otherCheapTickets.append(ticket);}

    }

    const renderCheapDay=(cheapTickets)=>{
       cheapestTicket.style.display='block';
       cheapestTicket.innerHTML='<h2>Самый дешевый билет на выбранную дату</h2>';
        let ticket = createCard(cheapTickets);
        cheapestTicket.append(ticket);
    }


    const renderCheap =(data, date)=>{
        const CheapTicket = JSON.parse(data).best_prices;
        const ticketDay =CheapTicket.filter((item)=>{
            return item.depart_date===date;
        })       
        renderCheapDay(ticketDay[0]);
        renderCheapYear(CheapTicket, date);
      // console.log(ticketDay);
    }; 

    otkuda.addEventListener('input',(e)=> { showCity(otkuda, dropdowncitiesfrom)});
    dropdowncitiesfrom.addEventListener('click', (event)=>{
        selectCity(otkuda, dropdowncitiesfrom)});


    inputCitiesto.addEventListener('input',(e)=> { showCity(inputCitiesto, dropdowncitiesto)});
    dropdowncitiesto.addEventListener('click', (event)=>{
       selectCity(inputCitiesto, dropdowncitiesto)});

    inputdatedepart.addEventListener('input',(e)=>{
        showData(inputdatedepart)});
    
    //повесили событие на форму,чтобы при нажатии кнопки не перезакружалось - event.preventDefault
        formSearch.addEventListener('submit', (e)=>{
        event.preventDefault();
            //wrapper.style.visibility="visible";
          //blockTicket.style.visibility="visible";
            wrapper.textContent='';
            blockTicket.textContent='';

        //перебираем массив сити в поиске значения из инпут (то, что ввел пользователь) - возвращаем 1 значение!
       //формируем объект в котором свойствами записываем введенные польхователем значения, взяв только то что нужно (код города...)
        

       const formData ={
            from: city.find((item)=>otkuda.value===item.name),
            to: city.find((item)=>inputCitiesto.value===item.name),
            when: inputdatedepart.value, 
        };
        if (formData.from && formData.to)
        {const requestData = '?depart_date='+formData.when+'&origin='+formData.from.code+'&destination='+formData.to.code+'&one_way=true&token='+API_TOKEN;
        //делаем запрос по адресу, которую сохранили в константу выше
        getData(proxy+calendar+requestData,(response)=>{
            renderCheap(response, formData.when); //дату отправляем в функцию чтобы сравнивать и выводить только на ту дату, которую ввел пользователь
        }, error =>{
            alert('Рейсов по данному направлению нет');
        });
        }
        else { alert('Введите корректное название города!');}
    });

    getData(proxy+citiesAPI, (data)=>{
        city=(JSON.parse(data));
        city.sort((a, b)=> {
           if (a.name > b.name) {
             return 1;
           }
           if (a.name < b.name) {
             return -1;
           }
           // a должно быть равным b
           return 0;
       });  
       
});   

