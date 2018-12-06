
var transport = function (data, callback) {
    chrome.extension.sendMessage(data, callback);
};

var wordstatWebAssistantLoad = function ($, window, transport) {
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
    $.fn.exists = function () {
        return this.length !== 0;
    }
    // Множественная форма слова
    function humanPluralForm(n, titles) {
        var cases = [2, 0, 1, 1, 1, 2];
        return titles[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[Math.min(n % 10, 5)]];
    }
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
        '<div id="windows-wrap">' +
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
        '</div>' +
        '<div class="container-fluid addWindow" id="addFromCopy">' +
          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-from-copy" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words">Ключевые слова</span></div>' +
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
        '</div>' +

        '<div class="container-fluid addWindow" id="addFromCopyMinus">' +
          '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-from-copy-minus" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
          
          '<div class="row no-gutters row-key-words">' +
            '<div class="col"><span class="span-title-words">Минус-слова</span></div>' +
          '</div>' +      
          '<div class="row no-gutters">' +
            '<div class="col word-add-col">' +
                '<textarea id="add-area-minus" placeholder="Добавьте слова"></textarea>' +
            '</div>' +
           '</div>' +
            '<div class="row no-gutters">' +
                '<div class="col word-add-col">' +
                    '<div class="button-wrap"><center><b class="button-window-add" id="button-add-minus">Добавить</b></center></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '</div>';

    $('BODY').prepend(addFromCopyTpl);

    var showNotificationTpl =
    '<div class="container-fluid notification">' +
        '<div class="row no-gutters row-top">' +
            '<div class="col" >' +
            '<div class="action-button-div action-button-div-logo"><i class="action-button-i action-button-i-logo" title="rocont.ru"></i></div>' +
            '<i class="cross" id="cross-small" title="Закрыть"></i>' +
            '</div>' +
          '</div>' +
        '<div class="row no-gutters">' +
            '<div class="col" id="colToAdd"></div>' +   
        '</div>' +
    '</div>';

     $('BODY').prepend(showNotificationTpl);

/*-------------------------------------------------------------------------------------------*/
    $('#imglog').click(function() {
        window.open('https://rocont.ru/');
    });

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
            var notice = '</div><p class="show-notification" id="notification-' + type + '">' + text + '</p>';   
            $('#colToAdd').html(notice);
            
            $('.notification').stop(true, true).show();
            $('#cross-small').click(function() {
                $('.notification').hide();
            });
            clearTimeout(log.timer);
            log.timer = setTimeout(function () {
                $('.notification').fadeOut(300);
            }, 2500);
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
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
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
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
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
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
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
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },

        // Загрузить минус-таблицу и настройки
        loadMinus: function (update) {
            storage.loadDataMinus();
            storage.loadOptionsMinus();
            if (update) {
                listMinus.update();
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
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                }
            }

            if (!$.isArray(wwaDataMinus)) {
                wwaDataMinus = [];
                storage.saveDataMinus(wwaDataMinus);
            }
            listMinus.data = listMinus.prepareDatas(wwaDataMinus);

            var input = $('.b-form-input__input').val();
            for(var i = 0; i < listMinus.data.length; i ++) {
                var wordWithMinus = '-' + listMinus.data[i];
                if(!(input.indexOf(wordWithMinus) + 1)){
                    input += ' ' + wordWithMinus;
                }
            }
            $('.b-form-input__input').val(input);

        },
        // Загрузить данные
        loadData: function () {
            var wwaData = localStorage['WordstatWebAssistant'];
            if (wwaData != '' && wwaData != undefined) {
                try {
                    wwaData = JSON.parse(wwaData);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    
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
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                   
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
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                    
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
                var c = listData[i].count > 0 ? numberSpaces(listData[i].count) : '?';
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

            observerAdd.disconnect();
            $('.new-search').each(function() {
                if($(this).parent().prev().text() == word) { 
                    $(this).prev().find('.plus-button').show();
                    $(this).prev().find('.minus-button').hide();
                    $(this).css("color", "#1a3dc1");
                    return;
                }
            });

            markMinus();
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

                $('.new-search').each(function() { 
                        $(this).prev().find('.plus-button').show();
                        $(this).prev().find('.minus-button').hide();
                        $(this).css("color", "#1a3dc1");
                });
                markMinus();


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
                var dataSplitted = data.split(' ');
                var isContain = true;
                for(var k = 0; k < dataSplitted.length; k++) {
                    if(!(listData[i].word.indexOf(dataSplitted[k]) + 1)) {
                        isContain = false;
                    }
                }
                if(isContain) {
                    if (confirm('Фраза "' + data + '" содержится в списке ключевых слов. Удалить из ключевых?')) {
                        list.remove(listData[i].word);
                        for(var j = i + 1; j < listData.length; j++) {
                            isContain = true;
                            for(var k = 0; k < dataSplitted.length; k++) {
                                if(!(listData[j].word.indexOf(dataSplitted[k]) + 1)) {
                                    isContain = false;
                                }
                            }
                            if(isContain) {
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
            var dataWithMinus = '-' + data;
            if(!(input.indexOf(dataWithMinus) + 1)) {
                input += ' ' + dataWithMinus;
            }
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
            var wordSplitted = word.split(' ');
            var wordWithMinus = '-' + wordSplitted[0];
            for(var i = 0; i < inputSplitted.length; i++) {
                if(!(inputSplitted[i] == wordWithMinus)) {
                    newInput += (inputSplitted[i] + ' ');
                }
                else {
                    i += (wordSplitted.length - 1);
                }
            }
            newInput = $.trim(newInput);
            $('.b-form-input__input').val(newInput);

            // Обновить и сохранить
            listMinus.update();
            storage.saveMinus();

            observerAdd.disconnect();
            $('.new-search').each(function() {
                if(!list.has($(this).parent().prev().text())) { 
                    $(this).prev().find('.plus-button').show();
                    $(this).prev().find('.minus-button').hide();
                    $(this).css("color", "#1a3dc1");
                    $(this).find('SPAN').css("background-color", "transparent");
                }
                
            });
            markMinus();
            doObserverAdd();
            // Сообщение
            //log.show('<b>' + word + '</b><br/> удалено из списка', 'info');
        },

        clear: function () {
            if (confirm('Вы действительно хотите очистить список минус-слов?')) {
                // Удалить из строки поиска
                var newInput ='';
                var inputSplitted = $('.b-form-input__input').val().split(' ');
                for(var i = 0; i < inputSplitted.length; i++) {
                    var isToAdd = true;
                    for(var j = 0; j < listMinus.data.length; j++) {
                        var wordMinusSplitted = listMinus.data[j].split(' ');
                        var wordWithMinus = '-' + wordMinusSplitted[0];
                        if(inputSplitted[i] == wordWithMinus) {
                            isToAdd = false;
                            break;
                        }
                    }
                    if(isToAdd) {
                        newInput += (inputSplitted[i] + ' ');
                    }
                    else {
                        i += (wordMinusSplitted.length - 1);
                    }
                }
                $('.b-form-input__input').val(newInput);

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
                        $(this).css("color", "#1a3dc1");
                        $(this).find('SPAN').css("background-color", "transparent");
                    }
                    
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
                    log.show('<b>Список скопирован в буфер обмена', 'success');
                } else {
                    log.show('<b>Ошибка:</b><br/>Не удалось скопировать список в буфер обмена', 'error');
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
            $(this).parent().next().css("color", "#8B93A6");

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
                var arrToDel = [];
                for(var i = 0; i < listMinus.data.length; i++) {
                    var minusWordSplitted = listMinus.data[i].split(' ');

                    var isContain = true;
                    for(var j = 0; j < minusWordSplitted.length; j++) {
                        var k;
                        for(k = 0; k < phraseSplitted.length; k++) {
                            if($.trim(phraseSplitted[k]) == $.trim(minusWordSplitted[j])){
                                break;
                            }
                        }
                        if(k == phraseSplitted.length) {
                            isContain = false;
                            break;
                        }
                    }
                    if(isContain) {
                        arrToDel.push(listMinus.data[i]);
                    }
                }
                for(var i = 0; i < arrToDel.length; i++) {
                    listMinus.remove(arrToDel[i]);
                }
            }

            $(this).parent().find('.plus-button').show();
            $(this).parent().find('.minus-button').hide();
        });

        
        var addAllKeyTpl = '<div addAll-wrap><b class="addAll">Добавить все</b>/<b class="delAll">Удалить все</b></div>';
        $('.b-word-statistics__table').before(addAllKeyTpl);

        $('.addAll').click(function () {
            if (confirm('Вы действительно хотите добавить в список все слова из этой таблицы?')) {
                var c = list.data.length;
                $(this).closest('.b-word-statistics__column').find('.word-action-button').each(function() {
                    var plusBut = $(this).find('.plus-button');
                    if($(plusBut).css('display') !== 'none') {
                        $(plusBut).click();
                    }
                });
                c = list.data.length - c;
                if (c > 0) {
                    log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                } else {
                    log.show('В список не было добавлено ни одного слова', 'warning');
                }
            }
        });
        $('.delAll').click(function () {
            if (confirm('Вы действительно хотите удалить все слова из этой таблицы?')) {
                $(this).closest('.b-word-statistics__column').find('.minus-button').click();
            }
        });
        markMinus();
        markPlus();
        // отслеживать
        doObserverAdd();
        if($('.ywh-body').exists()) {
             observerAdd.disconnect();
        }

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
     // Загрузка из csv
     /*$('#action-button-div-download').click(function() {
        var uploadFile = '<input type="file" id="upload-file" />';
        $('BODY').prepend(uploadFile);

        var fileContents = document.getElementById('upload-file');
        fileContents.click();
        fileContents.addEventListener('change', function (e) { 
            var fileTobeRead = fileContents.files[0];
            var fileReader = new FileReader();
            fileReader.onload = function(e) {}
            fileReader.readAsText(fileTobeRead);
            fileReader.onloadend = function () {
                var strings = fileReader.result.split('\n');
                var firstString = strings[0].split(';');
                if(!(firstString[0].indexOf('Ключевые слова') + 1) || !(firstString[1].indexOf('Частотность') + 1) || firstString.length != 2) {
                    log.show('Неверный формат файла', 'error');
                    return;
                }
                for(var i = 1; i < strings.length - 1; i++) {
                    var stringSplitted = strings[i].split(';');
                    if(stringSplitted.length == 2) {
                        var w = $.trim(stringSplitted[0]);
                        var c = $.trim(stringSplitted[1]);
                        list.add(w, c);
                        observerAdd.disconnect();
                        $('.word-action-button').each(function () {
                            var phrase = $(this).next().text();
                            if(phrase == w) {
                                $(this).find('.minus-button').show();
                                $(this).find('.plus-button').hide();
                            }
                        });
                        doObserverAdd();
                    }
                    else {
                        log.show('Неверный формат файла', 'error');
                        return;
                    }
                }
            }
        });
        $('#upload-file').hide();
     });*/

     /*$('#action-button-div-download-minus').click(function() {
        var uploadFile = '<input type="file" id="upload-file-minus" />';
        $('BODY').prepend(uploadFile);

        var fileContents = document.getElementById('upload-file-minus');
        fileContents.click();
        fileContents.addEventListener('change', function (e) { 
            var fileTobeRead = fileContents.files[0];
            var fileReader = new FileReader();
            fileReader.onload = function(e) {}
            fileReader.readAsText(fileTobeRead);
            fileReader.onloadend = function () {
                var strings = fileReader.result.split('\n');
                if(!(strings[0].indexOf('Минус-слова') + 1)) {
                    log.show('Неверный формат файла');
                    return;
                }
                for(var i = 1; i < strings.length - 1; i++) {
                    if(strings.indexOf(';') + 1) {
                        log.show('Неверный формат файла');
                        return;
                    }
                    var w = $.trim(strings[i]);
                    listMinus.add(w);
                }
            }
        });
        $('#upload-file-minus').hide();
     });*/
     /*-------------------------------------------------------------------------------------------*/
     // Загрузка из csv 
    $('#action-button-div-download').click(function() {
        var uploadFile = '<input type="file" id="upload-file" />';
        $('BODY').prepend(uploadFile);

        var fileContents = document.getElementById('upload-file');
        fileContents.click();
        fileContents.addEventListener('change', function () { 
            var fileTobeRead = fileContents.files[0];
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                var first_sheet_name = workbook.SheetNames[0];
                /* Get worksheet */
                var worksheet = workbook.Sheets[first_sheet_name];
                var worksheetJSON = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true
                });

                var keys = Object.keys(worksheetJSON[0]);
                if($.trim(keys[0]) != 'Ключевые слова' || $.trim(keys[1]) != 'Частотность') {
                    log.show('Неверный формат файла', 'warning');
                    return;
                }
                for(var i = 0; i < worksheetJSON.length; i++) {
                    var w = worksheetJSON[i][keys[0]];
                    var c = worksheetJSON[i][keys[1]];

                    list.add(w, c);
                    observerAdd.disconnect();
                    $('.word-action-button').each(function () {
                        var phrase = $(this).next().text();
                        if(phrase == w) {
                            $(this).find('.minus-button').show();
                            $(this).find('.plus-button').hide();
                        }
                    });
                    doObserverAdd();
                }

            }
            fileReader.readAsBinaryString(fileTobeRead);
        });   
        $('#upload-file').hide();
    });

    $('#action-button-div-download-minus').click(function() {
        var uploadFile = '<input type="file" id="upload-file-minus" />';
        $('BODY').prepend(uploadFile);

        var fileContents = document.getElementById('upload-file-minus');
        fileContents.click();
        fileContents.addEventListener('change', function () { 
            var fileTobeRead = fileContents.files[0];
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                var first_sheet_name = workbook.SheetNames[0];
                /* Get worksheet */
                var worksheet = workbook.Sheets[first_sheet_name];
                var worksheetJSON = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true
                });

                var keys = Object.keys(worksheetJSON[0]);
                console.log(keys.length);
                if($.trim(keys[0]) != 'Минус-слова') {
                    log.show('Неверный формат файла', 'warning');
                    return;
                }
                for(var i = 0; i < worksheetJSON.length; i++) {
                    var w = worksheetJSON[i][keys[0]];
                    listMinus.add(w);
                }

            }
            fileReader.readAsBinaryString(fileTobeRead);
        });   
        $('#upload-file-minus').hide();
    });


/*-------------------------------------------------------------------------------------------*/

/*-------------------------------------------------------------------------------------------------*/
    // Показать окно добавления фраз с заданной частотностью
        

        $('#action-button-div-range').click(function () {
            $('#addRange').show();

            $(document).keydown(function(e) {
                if( e.keyCode === 27 ) {
                    $('#addRange').hide();
                    $('#input-to').val('');
                    $('#input-from').val('');
                }
            });
            $('#cross-options').click(function() {
                $('#addRange').hide();
                $('#input-to').val('');
                $('#input-from').val('');
            });
        });

        var addFrequency = function(countFrom, countTo) {
            
            $(document).ready(function() {
                
                $('.b-word-statistics__column').first().find('.word-action-button').each(function() {
                        var plusBut = $(this).find('.plus-button');
                        if($(plusBut).css('display') !== 'none') {
                            var tmpCount = $(this).parent().parent().next().text();
                            tmpCount = parseInt((tmpCount + '').replace(/[^\d]/gi, ''));
                            if(isNaN(tmpCount)) {
                                tmpCount = -1;
                            }
                            if(tmpCount >= countFrom && tmpCount <= countTo) {
                                $(plusBut).click();
                            }
                            else if(tmpCount < countFrom) {
                               
                               return false;
                            }
                        }
                        console.log("a");
                });

                
            });
            
        }

        $('#button-apply').click(function () {
            $('#addRange').hide();

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
                if(isNaN(countTo)) {
                    log.show('Введите хотя бы одну границу частотности', 'warning');
                    return;
                }
                countFrom = 0;
            }
            if(isNaN(countTo)) {
                countTo = 1000000000;
            }
            
            var c = list.data.length;
            window.location = 'https://wordstat.yandex.ru/#!/?page=1&words=' + $('.b-form-input__input').val();
            var nextPageCount = 1;
            
            var timerId = setTimeout(function addFreq() {
              $(document).ready(function() {
                $('.b-word-statistics__column').first().find('.word-action-button').each(function() {
                        var plusBut = $(this).find('.plus-button');
                        if($(plusBut).css('display') !== 'none') {
                            var tmpCount = $(this).parent().parent().next().text();
                            tmpCount = parseInt((tmpCount + '').replace(/[^\d]/gi, ''));
                            if(isNaN(tmpCount)) {
                                tmpCount = -1;
                            }
                            if(tmpCount >= countFrom && tmpCount <= countTo) {
                                $(plusBut).click();
                            }
                            else if(tmpCount < countFrom) {
                               clearTimeout(timerId);
                               setTimeout(function() {
                                    window.location = 'https://wordstat.yandex.ru/#!/?page=1&words=' + $('.b-form-input__input').val();
                                    c = list.data.length - c;
                                    if (c > 0) {
                                        log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                                    } else {
                                        log.show('В список не было добавлено ни одного слова', 'warning');
                                    }
                                }, 1000);
                               return false;
                            }
                        }
                        
                });
                nextPageCount++;
                window.location = 'https://wordstat.yandex.ru/#!/?page=' + nextPageCount + '&words=' + $('.b-form-input__input').val();
                
                });
              timerId = setTimeout(addFreq, 1000);
            }, 1000);
                
        });

     // Показать окно добавления фраз копированием 
     
     $('#action-button-div-add').click(function() {
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
     });
     
     $('#action-button-div-add-minus').click(function() {
        $('#addFromCopyMinus').show();
        $(document).keydown(function(e) {
            if( e.keyCode === 27 ) {
                $('#addFromCopyMinus').hide();
                $('#add-area-minus').val('');
            }
        });
        $('#cross-from-copy-minus').click(function() {
            $('#addFromCopyMinus').hide();
            $('#add-area-minus').val('');
        });
     });
     // Добавить слова и убрать окно добавления слов
      $('#button-add').click(function() {
        
        $('#addFromCopy').hide();
        var wordsToAdd = $('#add-area').val();
        $('#add-area').val('');
        
        var wordsToAddSplitted = wordsToAdd.split('\n');
        for(var i = 0; i < wordsToAddSplitted.length; i++) {
            list.add(wordsToAddSplitted[i]);
        }    
      });
      $('#button-add-minus').click(function() {
        $('#addFromCopyMinus').hide();
        var wordsToAdd = $('#add-area-minus').val();
        $('#add-area-minus').val('');
        
        var wordsToAddSplitted = wordsToAdd.split('\n');
        for(var i = 0; i < wordsToAddSplitted.length; i++) {
            listMinus.add(wordsToAddSplitted[i]);
        }
      });

/*-------------------------------------------------------------------------------------------*/
    // Работа с минус-режимом при нажатии ctrl
    var mark = function() {
        markPlus();
        markMinus();
    }

    var markPlus = function() {
        observerAdd.disconnect();
        $('.new-search').each(function () {
            if(list.has($(this).text())) {
                $(this).css("color", "#8B93A6");
            }
        });
        doObserverAdd();
    }

    var minusPhrase = '';
    var link;


    var replaceLink = function() {
        observerAdd.disconnect();
        $('.new-search').each(function () {
            var wordChilds = $(this).children(".word-parsed");
            var phraseMinusMode = '';
            for(var i = 0; i < wordChilds.length - 1; ++i) {
                phraseMinusMode += ($(wordChilds[i]).text() + ' ');
            }
            phraseMinusMode += $(wordChilds[i]).text();
            var phraseMinusModeSpaced = phraseMinusMode + ' ';
                
             $(this).replaceWith('<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phraseMinusMode + '" target="_self" style="text-decoration:underline;">' + $(this).html() + '</a>');

        }); 
    }
    var bodyHandler = function(event) {
        var target = $(event.target);
        if(target.attr('class') == 'word-parsed') {
                target.hover(function() {
                    target.css("background-color", "#c2d2ff");
                }, function() {
                    target.css("background-color", "#c2d2ff");
                });
                if(!link || link.is(target.parent())) {
                    if(!(minusPhrase.indexOf(target.text()) + 1)) {
                        minusPhrase += target.text() + ' ';
                    }
                }
                else if(link){
                    listMinus.add(minusPhrase);
                    minusPhrase = target.text() + ' ';
                }
                link = target.parent();
        }
        else if(target.css('cursor') == 'pointer') {
            isCtrlDown = false;
            listMinus.add(minusPhrase);
            replaceLink();
            mark();
            minusPhrase = '';
            $('body').unbind('click', bodyHandler);
            link = null;
        }
    }

    var isCtrlDown = false;
    var isTriggered = false;
    $(document).keyup(function (e) {
        if(e.which == 17 || e.metaKey) {
            isCtrlDown = false;
            listMinus.add(minusPhrase);
            replaceLink();
            mark();
            minusPhrase = '';
            $('body').unbind('click', bodyHandler);
            link = null;
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
            $('body').click(bodyHandler);

            minusPhrase = $.trim(minusPhrase);
            mark();
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
    /*setTimeout(function () {
        storage.load(true);
    }, 2000);*/

    storage.loadMinus(true);
    /*setTimeout(function () {
        storage.loadMinus(true);
    }, 2000);*/


 };

jQuery(function () {
   wordstatWebAssistantLoad(jQuery, window, transport);
});  

// no conflict
jQuery.noConflict();