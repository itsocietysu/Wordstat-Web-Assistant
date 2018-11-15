
var wordstatWebAssistantLoad = function ($, window) {
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

    // Блок плагина
    var bodyTpl = 
    '<div class="container-fluid" id="main">' +
      
      '<div class="row no-gutters" id="row-top">' +
        '<div class="col" >' +
        '<div class="action-button-div" id="action-button-div-logo"><i class="action-button-i" id="action-button-i-logo"></i></div>' +
        '<div class="action-button-div" id="action-button-div-range"><i class="action-button-i" id="action-button-i-range" title="Сортировать"></i></div>' +
        '<div class="action-button-div" id="action-button-div-export"><i class="action-button-i" id="action-button-i-export" title="Экспортировать"></i></div>' +
        '</div>' +
      '</div>' +
      
      '<div class="row no-gutters" id="row-key-words">' +
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
      '<div class="row no-gutters" id="row-key-words">' +
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


    var itemTpl = '<li><span>{word} ({count})</span><div class="words-del-div"><i class="words-del" title="Удалить из списка"></i></div></li>';
    
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

    // Добавление пробелов в числе между разрядами
    function numberSpaces(number) {
        return number.toString().replace(/(?=\B(?:\d{3})+\b)/g, '&nbsp;');
    }

   // Лог
    var log = {
        // Таймер
        timer: undefined,

        // Уведомление
        show: function (text, type) {
            var notice = '<div class="show-notification-' + type + '">' + text + '</div>';
            $('.notification').html(notice);
            $('.notification').stop(true, true).show();
            clearTimeout(log.timer);
            log.timer = setTimeout(function () {
                $('.notification').fadeOut(300);
            }, 2000);
        }

    };

   // Действия со списком
    var list = {

        // Данные
        data: [],

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

            // Результат
            return data;
        },


        // Добавить
        add: function (word, count) {
            
            
            // Подготовим данные
            var data = list.prepareData(word, count);
            if (!data) {
                return;
            }

            // Уже есть в списке?
            /*if (list.has(data.word)) {
                log.show('<b>' + data.word + '</b><br/> уже есть в списке', 'warning');
                return;
            }*/

            // Добавить фразу в список
            list.data.unshift(data);

            // Обновить и сохранить
            list.update();
            //storage.save();

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

            // Вернуть результат
            return {
                word: word,
                count: count
            };

        },
    };


    // Добавление кнопок и парсинг фразы
    var addActionButtons = function () {
        observerAdd.disconnect();

        // Костыль
        $(".b-icon_type_question").remove();

        // Кнопки добавления / удаления фраз
        $(".b-icon_type_question").remove();
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

        $('.plus-button').click(function () {
            list.add(
                $(this).parent().parent().prev().text(),
                $(this).parent().parent().parent().next().text()
            );
            $(this).parent().find('.plus-button').hide();
            $(this).parent().find('.minus-button').show();
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

    $('#minus-mode-on').click(function () {
        observerAdd.disconnect();
        $('.new-search').each(function () {  
            $(this).replaceWith('<a class="new-search">' + $(this).html() + '</a>');
        });

        $('.word-parsed').hover(function() {
            $(this).css("background-color", "#fad8d9");
        }, function() {
            $(this).css("background-color", "transparent");
        });
        doObserverAdd();
    });

    $('#minus-mode-off').click(function () {
        observerAdd.disconnect();
        $('.new-search').each(function () {
            
            wordChilds = $(this).children(".word-parsed");
            var phraseMinusMode = '';
            for(var i = 0; i < wordChilds.length - 1; ++i) {
                phraseMinusMode += ($(wordChilds[i]).text() + ' ');
            }
            phraseMinusMode += $(wordChilds[i]).text();
    
            $(this).replaceWith('<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phraseMinusMode + '" target="_self" style="text-decoration:underline;">' + $(this).html() + '</a>');
        });

        $('.word-parsed').hover(function() {
            $(this).css("background-color", "transparent");
        }, function() {
            $(this).css("background-color", "transparent");
        });
        doObserverAdd();
    });      
    

 };

jQuery(function () {
   wordstatWebAssistantLoad(jQuery, window);
});  

// no conflict
jQuery.noConflict();