
var wordstatWebAssistantLoad = function ($, window) {
    //прописываем мета для bootstrap
    //var metaBootStrap = '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
    //$('HEAD').prepend(metaBootStrap);


    // Основной блок (для отслеживания изменений)
    var contentBlock = $('.b-wordstat-content');

    // Блок плагина
    var bodyTpl = 
    '<div class="container-fluid" id="main">' +
      '<div class="row text-center">' +
        '<div class=col>Wordstat Web-Assistant</div>' +
      '</div>' +
      '<div class="row text-center">' +
        '<div class="col">+</div>' +
        '<div class="col">copy</div>' +
        '<div class="col">del</div>' +
      '</div>' +    
      '<div class="row text-center">' +
        '<div class="col">Список слов</div>' +
        '<div class="col">Список минус-слов</div>' +
      '</div>' +
       '<div class="row text-center">' +
        '<div class="col">abc</div>' +
        '<div class="col">123</div>' +
      '</div>' +     
      '<div class="row text-center">' +
        '<div class="col">' +
            '<ul class="list-group">' +
             '<li class="list-group-item">Dapibus ac facilisis in</li>' +
             '<li class="list-group-item">Dapibus ac facilisis in</li>' +
             '<li class="list-group-item">Dapibus ac facilisis in</li>' +
             '<li class="list-group-item">Dapibus ac facilisis in</li>' +
            '</ul>' +
        '</div>' +
      '</div>' +
    '</div>';

    // Добавим wwa в начало BODY
    $('BODY').prepend(bodyTpl);



   // Действия со списком
    var list = {


        // Данные
        data: [],

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
    };

    window.onload = function () {
        //observerAdd.disconnect();
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
        console.log(document.querySelectorAll('.b-phrase-link'));

        // вывести + или - и сохранить фразу
        $('.word-action-button').each(function () {
            var phrase = $(this).next().text();
            phrase = $.trim(phrase);
            if (list.has(phrase)) {
                $('.minus-button', this).data('phrase', phrase);
                $('.minus-button', this).show();
            } else {
                $('.plus-button', this).data('phrase', phrase);
                $('.plus-button', this).show();
            };
        });

        //Переход между режимами
        var modesHtml = '<div class="minus-mode"><b class="minus-mode-on">Перейти в минус-режим</b> / <b class="minus-mode-off">Перейти в обычный режим</b></div>';
        $('.b-word-statistics__table').before(modesHtml);

        /*$('.minus-mode-on').click(function () {
            //observerAdd.disconnect();
            $('.new-search').each(function () {
                $(this).replaceWith('<a>' + $(this).html() + '</a>');
            });


            $('.word-parsed').hover(function() {
                $(this).css("background-color", "#fad8d9");
            }, function() {
                $(this).css("background-color", "transparent");
            });
            //doObserverAdd();
        });

        $('.minus-mode-off').click(function () {
            //observerAdd.disconnect();
            $('.new-search').each(function () {
                var phraseMinusMode = 'asd';
                $(this).replaceWith('<a class="new-search" href="https://wordstat.yandex.ru/#!/?words=' + phraseMinusMode + '" target="_self" style="text-decoration:underline;">' + $(this).html() + '</a>');
            });

            $('.word-parsed').hover(function() {
                $(this).css("background-color", "transparent");
            }, function() {
                $(this).css("background-color", "transparent");
            });
            //doObserverAdd();
        }); */      
        // отслеживать
        //doObserverAdd();
       
    };

    //Отслеживание изменений
    /*var target = contentBlock.get(0);
    var observerOptions = {childList: true, subtree: true};
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;


    var observerAdd = new MutationObserver(addActionButtons);
    var doObserverAdd = function () {
        observerAdd.observe(target, observerOptions);
    };*/   

    
    

 };

jQuery(function () {
   wordstatWebAssistantLoad(jQuery, window);
});  

// no conflict
jQuery.noConflict();