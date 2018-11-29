
var transport = function (data, callback) {
    chrome.extension.sendMessage(data, callback);
};

var wordstatWebAssistantLoad = function ($, window, transport) {
    //прописываем мета для bootstrap
    //var metaBootStrap = '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
    //$('HEAD').prepend(metaBootStrap);


    // Основной блок (для отслеживания изменений)
    var contentBlock = $('.b-wordstat-content');

    // Настройки
    var options = {
        // Сортировка
        order: 'abc', // abc, count
        sort: 'asc' // asc, desc
    };

    var optionsMinus = {
        // Сортировка
        order: 'abc', // abc
        sort: 'asc' // asc, desc
    };
    /*-------------------------------------------------------------------------------------------*/
    // Блок плагина
    var bodyTpl = 
    '<div class="container-fluid" id="main">' +
      
      '<div class="row no-gutters row-top">' +
        '<div class="col" >' +

        '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
        '<div class="action-button-div" id="action-button-div-range"><i class="action-button-i" id="action-button-i-range" title="Задать частотность"></i></div>' +
        '<div class="action-button-div" id="action-button-div-export"><i class="action-button-i" id="action-button-i-export" title="Экспортировать в csv"></i></div>' +
        '</div>' +
      '</div>' +
      
      '<div class="row no-gutters row-key-words">' +
        '<div class="col"><span class="span-title-words">Ключевые слова</span></div>' +
      '</div>' + 
      '<div class="row no-gutters row-actions">' +
        '<div class="col">' +
        '<div class="action-button-div" id="action-button-div-add"><i class="action-button-i action-button-i-add" title="Добавить"></i></div>' +
        '<div class="action-button-div" id="action-button-div-download"><i class="action-button-i action-button-i-download" title="Загрузить список"></i></div>' +
        '<div class="action-button-div" id="action-button-div-copy"><i class="action-button-i action-button-i-copy" title="Копировать"></i></div>' +
        '<div class="action-button-div" id="action-button-div-copy-range"><i class="action-button-i action-button-i-copy-range" title="Копировать с частотностью"></i></div>' +
        '<div class="action-button-div" id="action-button-div-delete"><i class="action-button-i action-button-i-delete" title="Очистить"></i></div>' +
        '</div>' +
      '</div>' +        
      '<div class="row no-gutters" id="words-list">' +
        '<div class="col">' +
            '<ul class="list-group" id="list-group-plus">' +
            '</ul>' +
        '</div>' +
      '</div>' +  
      '<div class="row no-gutters" id="line-separation">' +
      '</div>' +
      '<div class="row no-gutters row-key-words">' +
        '<div class="col"><span class="span-title-words">Минус-слова</span></div>' +
      '</div>' +
      '<div class="row no-gutters row-actions">' +
        '<div class="col">' +
            '<div class="action-button-div" id="action-button-div-add-minus"><i class="action-button-i action-button-i-add" title="Добавить"></i></div>' +
            '<div class="action-button-div" id="action-button-div-download-minus"><i class="action-button-i action-button-i-download" title="Загрузить список"></i></div>' +
            '<div class="action-button-div" id="action-button-div-copy-minus"><i class="action-button-i action-button-i-copy" title="Копировать"></i></div>' +
            '<div class="action-button-div" id="action-button-div-delete-minus"><i class="action-button-i action-button-i-delete" title="Очистить"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="row no-gutters" id="words-list">' +
        '<div class="col">' +
            '<ul class="list-group" id="list-group-minus">' +
            '</ul>' +
        '</div>' +
      '</div>' +   
    
    '</div>';

    // Добавим wwa в начало BODY
    $('BODY').prepend(bodyTpl);

    var body = $('#main');
    var selectedSearchType = function () {
        
        var el = $('input[name=search_type]:checked');
        if (el.val() == 'history') {
            body.hide();
        } else {
            body.show();
        }
    };
    $('input[name=search_type]').change(function () {
        selectedSearchType();
    });
    selectedSearchType();

    // Окно добавления фраз копированием 
    var addFromCopyTpl = 
        '<div class="container-fluid addWindow" id="addFromCopy">' +
          
          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-from-copy" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words"></span></div>' +
          '</div>' +      
          '<div class="row no-gutters">' +
            '<div class="col word-add-col">' +
                '<textarea id="add-area" placeholder="Добавьте слова"></textarea>' +
            '</div>' +
           '</div>' +
            '<div class="row no-gutters">' +
                '<div class="col word-add-col">' +
                    '<div class="button-wrap"><center><b class="button-window-add" id="button-add">Добавить</b></center></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    $('BODY').prepend(addFromCopyTpl);

    // Окно добавления фраз с заданной частотностью
    var addOptionsTpl = 
        '<div class="container-fluid addWindow" id="addRange">' +

          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-options" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words">Сортировка</span></div>' +
          '</div>' +      
          '<div class="row no-gutters">' +
            '<div class="col word-add-col">' +
                '<input class="input-frequency" id="input-from" placeholder="от"></input><input class="input-frequency" id="input-to" placeholder="до"></input>' +
            '</div>' +
           '</div>' +
            '<div class="row no-gutters">' +
                '<div class="col word-add-col">' +
                    '<div class="button-wrap"><center><b class="button-window-add" id="button-apply">Применить</b></center></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    $('BODY').prepend(addOptionsTpl);

    var showNotificationTpl =
    '<div class="notification"></div>';

     $('BODY').prepend(showNotificationTpl);

/*-------------------------------------------------------------------------------------------*/
    // Шаблон элемента списка слов
    var itemTpl = '<li><div class="li-wrap"><span>{word}</span> ({count})</div><div class="words-del-div"><i class="words-del" title="Удалить из списка"></i></div></li>';
    // Шаблон элемента списка минус-слов
    var itemTplMinus = '<li><span>{word}</span><div class="words-del-div"><i class="words-del" title="Удалить из списка"></i></div></li>';

    
    // Nano Templates
     $.nano = function (template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
            var keys = key.split(".");
            var value = data[keys.shift()];
            $.each(keys, function () {
                value = value[this];
            });
            return (value === null || value === undefined) ? "" : value;
        });
    };

    // Подстановка в шаблон для минус-слов
    $.nanoMinus = function (template, data) {
        return template.replace(/\{([\w\.]*)\}/g, data.word);
    };

    // Добавление пробелов в числе между разрядами
    function numberSpaces(number) {
        return number.toString().replace(/(?=\B(?:\d{3})+\b)/g, '&nbsp;');
    }
/*-------------------------------------------------------------------------------------------*/
   // Лог
    var log = {
        // Таймер
        timer: undefined,

        // Уведомление
        show: function (text, type) {
        
            var notice = '<div class="show-notification" id="notification-' + type + '">' + text + '</div>'+
                            '<i id="cross-small"></i>';
            $('.notification').html(notice);
            $('.notification').stop(true, true).show();
            $('#cross-small').click(function() {
                $('.notification').hide();
            });
            clearTimeout(log.timer);
            log.timer = setTimeout(function () {
                $('.notification').fadeOut(300);
            }, 2000);
        }

    };
/*-------------------------------------------------------------------------------------------*/
    // Хранилище
    var storage = {

        // Сохранить
        save: function () {
            storage.saveData();
            storage.saveOptions();
        },
        // Сохранить минус-режим
        saveMinus: function () {
            storage.saveDataMinus();
            storage.saveOptionsMinus();
        },

        // Сохранить данные минус-таблицы
        saveDataMinus: function (wwaDataMinus) {

            if (!wwaDataMinus) {
                wwaDataMinus = listMinus.data;
            }

            try {
                localStorage['WordstatWebAssistantMinus'] = JSON.stringify(wwaDataMinus);
            } catch (e) {
                //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                console.log("Error");
            }
        },

        // Сохранить данные
        saveData: function (wwaData) {
            if (!wwaData) {
                wwaData = list.data;
            }
            try {
                localStorage['WordstatWebAssistant'] = JSON.stringify(wwaData);
            } catch (e) {
                //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                console.log("Error");
            }
        },

        // Сохранить настройки минус-таблицы
        saveOptionsMinus: function (wwaOptionsMinus) {
            if (!wwaOptionsMinus) {
                wwaOptionsMinus = optionsMinus;
            }
            try {
                localStorage['WordstatWebAssistantOptionsMinus'] = JSON.stringify(wwaOptionsMinus);
            } catch (e) {
                //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                console.log("Error");
            }
        },
        // Сохранить настройки
        saveOptions: function (wwaOptions) {
            if (!wwaOptions) {
                wwaOptions = options;
            }
            try {
                localStorage['WordstatWebAssistantOptions'] = JSON.stringify(wwaOptions);
            } catch (e) {
                //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                console.log("Error");
            }
        },

        // Загрузить минус-таблицу и настройки
        loadMinus: function (update) {
            storage.loadDataMinus();
            storage.loadOptionsMinus();
            if (update) {
                listMinus.update();
                markMinus();
            }
        },
        // Загрузить
        load: function (update) {
            storage.loadData();
            storage.loadOptions();
            if (update) {
                list.update();
            }
        },

        // Загрузить данные минус-таблицы
        loadDataMinus: function () {
            var wwaDataMinus = localStorage['WordstatWebAssistantMinus'];
            if (wwaDataMinus != '' && wwaDataMinus != undefined) {
                try {
                    wwaDataMinus = JSON.parse(wwaDataMinus);
                } catch (e) {
                    //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    console.log("Error");
                }
            }

            if (!$.isArray(wwaDataMinus)) {
                wwaDataMinus = [];
                storage.saveDataMinus(wwaDataMinus);
            }
            listMinus.data = listMinus.prepareDatas(wwaDataMinus);

        },
        // Загрузить данные
        loadData: function () {
            var wwaData = localStorage['WordstatWebAssistant'];
            if (wwaData != '' && wwaData != undefined) {
                try {
                    wwaData = JSON.parse(wwaData);
                } catch (e) {
                    //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    console.log("Error");
                }
            }
            if (!$.isArray(wwaData)) {
                wwaData = [];
                storage.saveData(wwaData);
            }
            list.data = list.prepareDatas(wwaData);
        },

        // Загрузить настройки минус-таблицы
        loadOptionsMinus: function () {
            var wwaOptionsMinus = localStorage['WordstatWebAssistantOptionsMinus'];
            if (wwaOptionsMinus != '' && wwaOptionsMinus != undefined) {
                try {
                    wwaOptionsMinus = JSON.parse(wwaOptionsMinus);
                } catch (e) {
                    //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    console.log("Error");
                }
            }
            if (!(wwaOptionsMinus && ('order' in wwaOptionsMinus) && ('sort' in wwaOptionsMinus))) {
                wwaOptionsMinus = optionsMinus;
                storage.saveOptionsMinus(wwaOptionsMinus);
            }
            optionsMinus = wwaOptionsMinus;
        },
        // Загрузить настройки
        loadOptions: function () {
            var wwaOptions = localStorage['WordstatWebAssistantOptions'];
            if (wwaOptions != '' && wwaOptions != undefined) {
                try {
                    wwaOptions = JSON.parse(wwaOptions);
                } catch (e) {
                    //log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    console.log("Error");
                }
            }
            if (!(wwaOptions && ('order' in wwaOptions) && ('sort' in wwaOptions))) {
                wwaOptions = options;
                storage.saveOptions(wwaOptions);
            }
            options = wwaOptions;
        }

    };
/*-------------------------------------------------------------------------------------------*/
    //Действия со списком слов
    var list = {

        // Данные
        data: [],

        //Обновить
        update: function () {
            var html = '';
            var listData = list.data.slice(0);

            for (var i = 0; i < listData.length; ++i) {
                var w = listData[i].word;
                var c = listData[i].count > 0 ? numberSpaces(listData[i].count) : ' ';
                html += $.nano(itemTpl, {word: w, count: c});
                
            }
            $('#list-group-plus').html(html);
        },

        /**
         * Возвращает отсортированные данные
         * @returns array
         */
        sortData: function () {

            // Клонируем список
            var data = list.data.slice(0);

            // Сортировка
            switch (options.order) {

                // По алфавиту
                case 'abc':
                    data.sort(function (a, b) {
                        var compA = a.word.toUpperCase();
                        var compB = b.word.toUpperCase();
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

                // По частотности
                case 'count':
                    data.sort(function (a, b) {
                        var compA = a.count;
                        var compB = b.count;
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

            }

            // Порядок
            if (options.sort == 'desc') {
                data.reverse();
            }

            return data;
        },

         // Проверка на наличие фразы
        has: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return false;
            }

            // Проверка на наличие
            return list.data.some(function (item) {
                return item.word == word;
            });
        },

        /**
         * Возвращает подготовленные данные
         * @returns array
         */
        prepareData: function (word, count) {

            // Подготовить фразу
            word = $.trim(word);
            if (typeof(word) != 'string' || word == '') {
                return false;
            }

            // Подготовить частотность
            count = parseInt((count + '').replace(/[^\d]/gi, ''));
            if (isNaN(count)) {
                count = 0;
            }

            return {
                word: word,
                count: count
            };

        },

        /**
         * Возвращает подготовленные данные массива
         * @returns array
         */
        prepareDatas: function (listWord) {

            var result = [];
            if ($.isArray(listWord)) {
                for (var i = 0; i < listWord.length; ++i) {
                    if (typeof(listWord[i]) == 'object') {
                        var data = list.prepareData(
                            listWord[i].word ? listWord[i].word : '',
                            listWord[i].count ? listWord[i].count : 0
                        );
                        if (data) {
                            result.push(data);
                        }
                    } else if (typeof(listWord[i]) == 'string') {
                        var data = list.prepareData(listWord[i], 0);
                        if (data) {
                            result.push(data);
                        }
                    }
                }
            }
            return result;
        },

        // Добавить
        add: function (word, count) {
            // Подготовим данные
            var data = list.prepareData(word, count);
            if (!data) {
                return;
            }

            // Уже есть в списке?
            if (list.has(data.word)) {
                log.show('<b>(' + data.word + ')</b> уже есть в списке', 'warning');
                return;
            }

            var listMinusData = listMinus.data.slice(0);
            
            for(var i = 0; i < listMinusData.length; i++) {
                //console.log(data.word);
                if(data.word.indexOf(listMinusData[i]) + 1) {
                    if (confirm('Фраза "' + listMinusData[i] + '" содержится в списке минус-слов. Удалить из минус-слов?')) {
                        for(var j = i; j < listMinusData.length; j++) {
                            if(data.word.indexOf(listMinusData[j]) + 1) {
                                listMinus.remove(listMinusData[j]);

                                observerAdd.disconnect();
                                $('.word-action-button').each(function () {
                                    var phrase = $(this).next().text();
                                    if(phrase.indexOf(listMinusData[j]) + 1) {
                                        $(this).find('.plus-button').show();
                                        $(this).find('.minus-button').hide();
                                    }
                                });
                                doObserverAdd();
                            }
                        }
                    }
                    else {
                        return;
                    }
                    break;
                }
            }

            // Добавить фразу в список
            list.data.unshift(data);

            // Обновить и сохранить
            list.update();
            storage.save();

        },

        // Удалить фразу
        remove: function (word) {
           
            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return;
            }

            // Удалить
            list.data = list.data.filter(function (item) {
                return item.word != word;
            });

            // Обновить и сохранить
            list.update();
            storage.save();

            // Сообщение
            //log.show('<b>' + word + '</b><br/> удалено из списка', 'info');
        },

        // Очистить 
        clear: function () {
            if (confirm('Вы действительно хотите очистить список слов?')) {

                // Очистить
                list.data = [];

                // Сохранить и обновить
                list.update();
                storage.save();

                // Сообщение
                //log.show('Список очищен', 'info');
            }
        },

        // Копировать
        copy: function (withCount) {

            // А есть что копировать?
            if (list.data.length == 0) {
                //log.show('Нет слов для копирования', 'warning');
                return;
            }

            // Подготовим текст
            var text = '',
                listData = list.sortData();
            $.each(listData, function (i, item) {
                if (text != '')
                    text += '\n';
                text += item.word + (withCount ? '\t' + item.count : '');
            });

            // Копируем
            var config = {
                action: 'copy',
                text: text
            };
            transport(config, function (response) {
                if (response.result) {
                    log.show('<b>Список скопирован в буфер обмена</b>', 'success');
                } else {
                    log.show('<b>Ошибка:</b><br/>Не удалось скопировать список в буфер обмена', 'error');
                }
            });

        },
    };
/*-------------------------------------------------------------------------------------------*/

    var markMinus = function() {
        observerAdd.disconnect();
        $('.word-parsed').css("background-color", "transparent");
        for(var i = 0; i < listMinus.data.length; i++) {
            $('.new-search').each(function() {
                var keyWord = $(this).parent().prev().text();
                keyWord = keyWord + ' ';
                minusWordSplitted = listMinus.data[i].split(' ');
                var isContain = true;
                for(var j = 0; j < minusWordSplitted.length; j++) {
                    if(!(keyWord.indexOf(minusWordSplitted[j] + ' ') + 1)) {
                        isContain = false;
                        break;
                    }
                }
                if(isContain) {
                    $(this).prev().find('.minus-button').show();
                    $(this).prev().find('.plus-button').hide();
                    $(this).css("color", "#8B93A6")
                    $(this).find('SPAN').each(function () {
                        for(var j = 0; j < minusWordSplitted.length; j++) {   
                            if($(this).text() == minusWordSplitted[j]) {
                                $(this).css("background-color", "#fad8d9");
                            }
                        }
                    });
                }
                
            });
        }
        doObserverAdd();
    }
    /*---------------------------------------------------------------------------------------*/
   // Действия со списком минус-слов
    var listMinus = {

        // Данные
        data: [],

        update: function () {
            var html = '';
            var listData = listMinus.data.slice(0);

            for (var i = 0; i < listData.length; ++i) {
                var w = listData[i];
                html += $.nanoMinus(itemTplMinus, {word: w});
                
            }
            $('#list-group-minus').html(html);
        },

        /**
         * Возвращает отсортированные данные
         * @returns array
         */
        sortData: function () {

            // Клонируем список
            var data = listMinus.data.slice(0);

            // Сортировка
            switch (optionsMinus.order) {

                // По алфавиту
                case 'abc':
                    data.sort(function (a, b) {
                        var compA = a.toUpperCase();
                        var compB = b.toUpperCase();
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

            }

            // Порядок
            if (optionsMinus.sort == 'desc') {
                data.reverse();
            }

            // Результат
            return data;
        },

         // Проверка на наличие фразы
        has: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return false;
            }

            // Проверка на наличие
            return listMinus.data.some(function (curWord) {
                return curWord == word;
            });
        },

        /**
         * Возвращает подготовленные данные
         * @returns array
         */
        prepareData: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (typeof(word) != 'string' || word == '') {
                return false;
            }
            // Вернуть результат
            return word;

        },

        /**
         * Возвращает подготовленные данные массива
         * @returns array
         */
        prepareDatas: function (listWord) {

            var result = [];
            if ($.isArray(listWord)) {
                for (var i = 0; i < listWord.length; ++i) {
                    if (typeof(listWord[i]) == 'object') {
                        var data = listMinus.prepareData(
                            listWord[i] ? listWord[i] : '',
                        );
                        if (data) {
                            result.push(data);
                        }
                    } else if (typeof(listWord[i]) == 'string') {
                        var data = listMinus.prepareData(listWord[i]);
                        if (data) {
                            result.push(data);
                        }
                    }
                }
            }

            // Вернуть результат
            return result;
        },

        // Добавить
        add: function (word) {
            // Подготовим данные
            var data = listMinus.prepareData(word);
            if (!data) {
                return;
            }

            // Уже есть в списке?
            if (listMinus.has(data)) {
                log.show('<b>' + data + '</b><br/> уже есть в списке', 'warning');
                return;
            }
            
            var listData = list.data.slice(0);
            
            for(var i = 0; i < listData.length; i++) {
                if(listData[i].word.indexOf(data) + 1) {
                    if (confirm('Фраза "' + data + '" содержится в списке ключевых слов. Удалить из ключевых?')) {
                        for(var j = i; j < listData.length; j++) {
                            if(listData[j].word.indexOf(data) + 1) {
                                list.remove(listData[j].word);
                            }
                        }
                    }
                    else {
                        return;
                    }
                    break;
                }
            }

            //Добавить в строку поиска
            var input = $('.b-form-input__input').val();
            
            input = input + ' -' + data;
            $('.b-form-input__input').val(input);

            // Добавить фразу в список
            listMinus.data.unshift(data);

            // Обновить и сохранить
            listMinus.update();
            storage.saveMinus();

            markMinus();
        },

        // Удалить фразу
        remove: function (word) {
           
            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return;
            }

            // Удалить
            listMinus.data = listMinus.data.filter(function (curWord) {
                return curWord != word;
            });
            var newInput ='';
            var inputSplitted = $('.b-form-input__input').val().split(' ');
            for(var i = 0; i < inputSplitted.length; i++) {
                var wordWithMinus = '-' + word;
                if(!(inputSplitted[i] == wordWithMinus)) {
                    newInput += (inputSplitted[i] + ' ');
                }
            }
            $('.b-form-input__input').val(newInput);

            // Обновить и сохранить
            listMinus.update();
            storage.saveMinus();

            observerAdd.disconnect();
            $('.new-search').each(function() {
                if(!list.has($(this).parent().prev().text())) { 
                    $(this).prev().find('.plus-button').show();
                    $(this).prev().find('.minus-button').hide();
                }
                $(this).css("color", "#1a3dc1");
                $(this).find('SPAN').css("background-color", "transparent");
            });
            markMinus();
            doObserverAdd();
            // Сообщение
            //log.show('<b>' + word + '</b><br/> удалено из списка', 'info');
        },

        clear: function () {
            if (confirm('Вы действительно хотите очистить список минус-слов?')) {

                // Очистить
                listMinus.data = [];

                // Сохранить и обновить
                listMinus.update();
                storage.saveMinus();

                observerAdd.disconnect();
                $('.new-search').each(function() {
                    if(!list.has($(this).parent().prev().text())) { 
                        $(this).prev().find('.plus-button').show();
                        $(this).prev().find('.minus-button').hide();
                    }
                    $(this).css("color", "#1a3dc1");
                    $(this).find('SPAN').css("background-color", "transparent");
                });
                doObserverAdd();
                // Сообщение
                //log.show('Список очищен', 'info');
            }
        },

        // Копировать
        copy: function (withCount) {

            // А есть что копировать?
            if (listMinus.data.length == 0) {
                //log.show('Нет слов для копирования', 'warning');
                return;
            }

            // Подготовим текст
            var text = '',
                listData = listMinus.sortData();
            $.each(listData, function (i, item) {
                if (text != '')
                    text += '\n';
                text += item;
            });

            // Копируем
            var config = {
                action: 'copy',
                text: text
            };
            transport(config, function (response) {
                if (response.result) {
                    console.log("Success copy")
                    //log.show('<b>Список скопирован в буфер обмена', 'success');
                } else {
                    console.log("Error copy");
                    //log.show('<b>Ошибка:</b><br/>Не удалось скопировать список в буфер обмена', 'error');
                }
            });

        },


    };
/*-------------------------------------------------------------------------------------------*/
    // Добавление кнопок и парсинг фразы
    var addActionButtons = function () {
        observerAdd.disconnect();

        // Костыль
        $(".b-icon_type_question").remove();

        // Кнопки добавления / удаления фраз
        var templateWordAction = '<span class="word-action-button">' +
            '<b class="minus-button" style="display: none;" title="Удалить из списка">−</b>' +
            '<b class="plus-button" style="display: none;" title="Добавить в список">+</b>' +
            '</span>';

        // Скрываем сушествующую фразу и добавляем в нужном нам формате
        $('.b-phrase-link').each(function () {
            $(this).css("display", "none");

            //Парсим по словам
            var phrase = $(this).text();
            phrase = $.trim(phrase);
            wordsSplitted = phrase.split(' ');
            
            //Формируем html-код
            var newPhraseLink = '<span class="wwa-phrase-link">' +
                                        templateWordAction +
                                        '<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phrase + '" target="_self" style="text-decoration:underline;">';

            var phraseParsedHtml = '';
            for (var i = 0; i < wordsSplitted.length - 1; ++i) {
                phraseParsedHtml += ('<span class="word-parsed">' + wordsSplitted[i] + '</span><b> </b>');    
            }
            phraseParsedHtml += ('<span class="word-parsed">' + wordsSplitted[i] + '</span>');

            newPhraseLink += (phraseParsedHtml + '</a></span>');
            //Добавляем код на страницу
            $(this).after(newPhraseLink);

        });

        // вывести + или - и сохранить фразу
        $('.word-action-button').each(function () {
            var phrase = $(this).next().text();
            phrase = $.trim(phrase);
            if (list.has(phrase)) {
                //$('.minus-button', this).data('phrase', phrase);
                $('.minus-button', this).show();
            } else {
                
                $('.plus-button', this).show();
            };
        });

        // Добавить фразу
        $('.plus-button').click(function () {
            var phrase = $(this).parent().parent().prev().text();

            var listData = list.data.slice(0);
            for (var i = 0; i < listData.length; ++i) {
                var w = listData[i].word;
                var c = listData[i].count;
                if(phrase == w && c == 0) {
                    list.remove(phrase);
                    break;
                }
            }
            list.add(
                phrase,
                $(this).parent().parent().parent().next().text()
            );
            $(this).parent().find('.plus-button').hide();
            $(this).parent().find('.minus-button').show();
        });

        // Удалить фразу
        $('.minus-button').click(function () {
            var phrase = $(this).parent().parent().prev().text();
            if(list.has(phrase)) {
                list.remove(phrase);
            }
            else {
                var phraseSplitted = phrase.split(' ');
                for(var i = 0; i < phraseSplitted.length; i++) {
                    if(listMinus.has(phraseSplitted[i])) {
                        listMinus.remove(phraseSplitted[i]);
                    }
                }
            }
            $(this).parent().find('.plus-button').show();
            $(this).parent().find('.minus-button').hide();
        });

        
        var addAllKeyTpl = '<div addAll-wrap><b class="addAll">Добавить все</b>/<b class="delAll">Удалить все</b></div>';
        $('.b-word-statistics__table').before(addAllKeyTpl);

        $('.addAll').click(function () {
            if (confirm('Вы действительно хотите добавить в список все слова из этой таблицы?')) {
                //var c = list.data.length;
                $(this).closest('.b-word-statistics__column').find('.plus-button').click();
                /*c = list.data.length - c;
                if (c > 0) {
                    log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                } else {
                    log.show('В список не было добавлено ни одного слова', 'warning');
                }*/
            }
        });
        $('.delAll').click(function () {
            if (confirm('Вы действительно хотите удалить все слова из этой таблицы?')) {
                //var c = list.data.length;
                $(this).closest('.b-word-statistics__column').find('.minus-button').click();
                /*c = list.data.length - c;
                if (c > 0) {
                    log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                } else {
                    log.show('В список не было добавлено ни одного слова', 'warning');
                }*/
            }
        });

        // отслеживать
        doObserverAdd();
       
    };

    //Отслеживание изменений
    var target = contentBlock.get(0);
    var observerOptions = {childList: true, subtree: true};
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;


    var observerAdd = new MutationObserver(addActionButtons);
    var doObserverAdd = function () {
        observerAdd.observe(target, observerOptions);
    };
    doObserverAdd();
/*-------------------------------------------------------------------------------------------*/
    // ДЕЙСТВИЯ ПРИ КЛИКЕ НА ИКОНКИ

    // Логотип - ссылка на сайт
    $('.action-button-div-logo').click(function() {
       window.open('https://rocont.ru/');
    });
    // Удаление елемента из списка
    $('#list-group-plus').on('click', '.words-del-div', function () {
        var txt = $(this).parent().find('SPAN').text();
        list.remove(txt);
        
        observerAdd.disconnect();
        $('.word-action-button').each(function () {
            var phrase = $(this).next().text();
            if(phrase == txt) {
                $(this).find('.plus-button').show();
                $(this).find('.minus-button').hide();
                return false;
            }
            
        });
        doObserverAdd();
        
    });

    // Удаление элемента из минус-списка
    $('#list-group-minus').on('click', '.words-del-div', function () {
        var txt = $(this).parent().find('SPAN').text();
        listMinus.remove(txt);
    });

    // Очистить список
    $('#action-button-div-delete').click(function () {

        var data = list.data;
        list.clear();
        // Отобразить плюсы вместо минусов 
        observerAdd.disconnect();
        $('.word-action-button').each(function () {
            var phrase = $(this).next().text();
            for(var i = 0; i < data.length; i++) {
                if(phrase == data[i].word) {
                    $(this).find('.plus-button').show();
                    $(this).find('.minus-button').hide();
                }
            }
        });
        doObserverAdd();
    });

    //Очистить минус-список
    $('#action-button-div-delete-minus').click(function () {
        listMinus.clear();
    });

    // Копирование
    $('#action-button-div-copy').click(function () {
        list.copy(false);
    });
    // Копирование минус-списка
    $('#action-button-div-copy-minus').click(function () {
        listMinus.copy(false);
    }); 

     // Копирование с частотностю
     $('#action-button-div-copy-range').click(function () {
        list.copy(true);
     });
/*-------------------------------------------------------------------------------------------*/

/*-------------------------------------------------------------------------------------------------*/
    // Показать окно добавления фраз с заданной частотностью
        
        var showRangeWindow = function() {
            $('#addFromCopy').css("top", "250px");
            $('#addRange').show();

            $(document).keydown(function(e) {
                if( e.keyCode === 27 ) {
                    $('#addFromCopy').css("top", "100px");
                    $('#addRange').hide();
                    $('#input-to').val('');
                    $('#input-from').val('');
                }
            });
            $('#cross-options').click(function() {
                $('#addFromCopy').css("top", "100px");
                $('#addRange').hide();
                $('#input-to').val('');
                $('#input-from').val('');
            });
        };

        $('#action-button-div-range').click(function () {
            showRangeWindow();
        });


        $('#button-apply').click(function () {
            $('#addRange').hide();
            $('#addFromCopy').css("top", "100px");

            var countFrom = $('#input-from').val();
            countFrom = parseInt(countFrom);
            $('#input-from').val('');

            var countTo = $('#input-to').val();
            countTo = parseInt(countTo);
            $('#input-to').val('');

            if(countFrom > countTo) {
                var tmpCount = countFrom;
                countFrom = countTo;
                countTo = tmpCount;
            }

            if(isNaN(countFrom)){
                countFrom = 0;
            }
            if(isNaN(countTo)) {
                countTo = 1000000000;
            }

            //var c = list.data.length;
            
            $('.plus-button').each(function() {
                var tmpCount = $(this).parent().parent().parent().next().text();
                tmpCount = parseInt((tmpCount + '').replace(/[^\d]/gi, ''));
                if(isNaN(tmpCount)) {
                    tmpCount = -1;
                }
                if(tmpCount >= countFrom && tmpCount <= countTo) {
                    $(this).click();
                }
            });
            
            /*c = list.data.length - c;
            if (c > 0) {
                log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
            } else {
                log.show('В список не было добавлено ни одного слова', 'warning');
            }*/
        });

     // Показать окно добавления фраз копированием 
     
     var showAddWindow = function() {
        
        $('#addFromCopy').show();
        $(document).keydown(function(e) {
            if( e.keyCode === 27 ) {
                
                $('#addFromCopy').hide();
                $('#add-area').val('');
            }
        });
        $('#cross-from-copy').click(function() {
            
            $('#addFromCopy').hide();
            $('#add-area').val('');
        });
     };
     var isKeyWords;
     //В случае КС
     $('#action-button-div-add').click(function() {
        $('#addFromCopy').find('.span-title-words').html('Ключевые слова');
        isKeyWords = true;
        showAddWindow();
     });
     //В случае МС
     $('#action-button-div-add-minus').click(function() {
        $('#addFromCopy').find('.span-title-words').html('Минус-слова');
        isKeyWords = false;
        showAddWindow();
     });
     // Добавить слова и убрать окно добавления слов
      $('#button-add').click(function() {
        
        $('#addFromCopy').hide();
        var wordsToAdd = $('#add-area').val();
        $('#add-area').val('');
        
        var wordsToAddSplitted = wordsToAdd.split('\n');
        if(isKeyWords) {
            for(var i = 0; i < wordsToAddSplitted.length; i++) {
                list.add(wordsToAddSplitted[i]);
            }    
        }
        else {
            for(var i = 0; i < wordsToAddSplitted.length; i++) {
                listMinus.add(wordsToAddSplitted[i]);
            }              
        }
      });

/*-------------------------------------------------------------------------------------------*/
    // Работа с минус-режимом при нажатии ctrl
    var minusPhrase = '';

    var isCtrlDown = false;
    $(document).keyup(function (e) {
        if(e.which == 17 || e.metaKey) {
            isCtrlDown = false;
            listMinus.add(minusPhrase);
            observerAdd.disconnect();


            $('.new-search').each(function () {
                wordChilds = $(this).children(".word-parsed");
                var phraseMinusMode = '';
                for(var i = 0; i < wordChilds.length - 1; ++i) {
                    phraseMinusMode += ($(wordChilds[i]).text() + ' ');
                }
                phraseMinusMode += $(wordChilds[i]).text();
                var phraseMinusModeSpaced = phraseMinusMode + ' ';
                

                $(this).replaceWith('<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phraseMinusMode + '" target="_self" style="text-decoration:underline;">' + $(this).html() + '</a>');

            }); 
            markMinus();

            minusPhrase = '';
        }
    }).keydown(function (e) {
        if(e.which == 17 || e.metaKey) {
            if(isCtrlDown == true){
                return;
            }
            isCtrlDown = true;

            observerAdd.disconnect();
            $('.new-search').each(function () {  
                $(this).replaceWith('<a class="new-search">' + $(this).html() + '</a>');
            });

            $('.new-search').each(function () {  
                $(this).find('SPAN').each(function() {
                    if(!($(this).css('background-color').toLowerCase() == 'rgb(250, 216, 217)')) {
                        $(this).hover(function() {
                            $(this).css("background-color", "#c2d2ff");
                        }, function() {
                            $(this).css("background-color", "transparent");
                        });
                    }
                });
            });
            

            $('.word-parsed').click(function() {
                $(this).hover(function() {
                    $(this).css("background-color", "#c2d2ff");
                }, function() {
                    $(this).css("background-color", "#c2d2ff");
                });

                if(!(minusPhrase.indexOf($(this).text()) + 1)) {
                    minusPhrase += $(this).text() + ' ';
                }

            });
            minusPhrase = $.trim(minusPhrase);
            
            markMinus();
        }
    });
/*-------------------------------------------------------------------------------------------*/

 /*-------------------------------------------------------------------------------------------*/   
    // Выгрузка в csv
    jQuery.fn.toCSV = function(link, withCount, minusMode) {
      var $link = $(link);

      var data = $(this).first(); //Only one table

      var tmpStr = '';
      if(!withCount) {
        if(!minusMode) {
            tmpStr += 'Ключевые слова' + '\n';
        }
        else {
            tmpStr += 'Минус-слова' + '\n';
        }
        data.find('span').each(function() {
            tmpStr += $(this).text() + '\n';
        });
      }
      else {
        if(minusMode) {
            return;
        }
        tmpStr += 'Ключевые слова; Частотность' + '\n';
        data.find('span').each(function() {
            tmpStr += $(this).text() + ';';
            tmpCount = $(this).next().text();
            tmpCount = tmpCount.replace(/[()]/g, '');
            tmpStr += tmpCount + '\n';
        });
      }
      var BOM = '\uFEFF';
      var output = BOM + tmpStr;


      var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(output);
      $link.attr("href", uri);
    }

    function saveContent(fileName, withCount, minusMode)
    {
        var link = document.createElement('a');
        link.download = fileName + '.csv';
        if(minusMode) {
            $('#list-group-minus').toCSV(link, withCount, minusMode);
        }
        else {
            $('#list-group-plus').toCSV(link, withCount, minusMode);
        }
        link.click();
    }

    $('#action-button-div-export').click(function(e) {
        var fileName = prompt('Введите имя файла для сохранения ключевых слов', 'key-words');
        if(!(fileName == null || $.trim(fileName) == '' || list.data.length == 0)) {
            saveContent($.trim(fileName), true, false);
        }
        
        var minusFileName = prompt('Введите имя файла для сохранения ключевых слов', 'minus-words');
        if(!(minusFileName == null || $.trim(minusFileName) == '' || listMinus.data.length == 0)) {
             saveContent($.trim(minusFileName), false, true);
        }
       
    });

/*-------------------------------------------------------------------------------------------*/

/*-------------------------------------------------------------------------------------------*/

    // Загрузка данных и настроек 
    storage.load(true);
    setTimeout(function () {
        storage.load(true);
    }, 2000);

    storage.loadMinus(true);
    setTimeout(function () {
        storage.loadMinus(true);
    }, 2000);
 };

jQuery(function () {
   wordstatWebAssistantLoad(jQuery, window, transport);
});  

// no conflict
jQuery.noConflict();