$(function () {

//変数設定
var js_todo_content = $('#js_todo_content'),
		js_input_todo = $('#js_input_todo'),
		deleteAllBtn = $('#js_delete_all');

//body要素にランダムでclassをつけて、見出しの色を変更
$('#js_body').addClass('is_design' + (Math.floor(Math.random() * 5) + 1));

//タブの初期状態として「TODOの追加」をアクティブにする
if (!$('#js_todo_menu').find('li').hasClass('is_active')) {
	$('#js_add_tab').addClass('is_active');
	$('#js_display_todo').hide();
	$('#js_todo_tit').text('TODOの追加');
}

//「TODO一覧の表示」をアクティブにする
$('#js_list_tab').on('click', function(){
	//「TODO一覧の表示」にアクティブ用のclassがなかった場合
	if (!$(this).hasClass('is_active')) {
		$(this).addClass('is_active').prev().removeClass('is_active');
		$('#js_label_todo').hide().next().hide();
		$('#js_add_todo').hide().next().show();
		$('#js_todo_tit').text('TODO一覧の表示');
	}
});

//「TODOの追加」をアクティブにする
$('#js_add_tab').on('click', function(){
	//「js_add_tab」にアクティブ用のclassがなかった場合
	if (!$(this).hasClass('is_active')) {
		$(this).addClass('is_active').next().removeClass('is_active');
		$('#js_label_todo').show().next().show();
		$('#js_add_todo').show().next().hide();
		$('#js_todo_tit').text('TODOの追加');
	}
});

//TODOの追加
$('#js_add_todo').on('click', function(){
	//フォームにテキストが入っていたらTodoリストを追加する
	if(($(js_input_todo).val() !== '') && ($('#js_input_name').val() !== '')) {
		//Ajax通信の設定
		var ajaxUrl = '',
				ajaxType = 'POST';

		//JSONファイルの取得
		getTodoData(ajaxUrl, ajaxType);
	}
});

//TODO一覧の表示
$('#js_display_todo').on('click', function(){
	if($('#js_todo_content').css('display') === 'none') {
		//Ajax通信の設定
		var ajaxUrl = '?app_name=' + $('#js_input_name').val(),
				ajaxType = 'GET'

		//JSONデータの取得
		getTodoData(ajaxUrl, ajaxType);
	}
});

//TODOデータを操作する関数
var getTodoData = function(url, type){
	$.ajax({
		url: 'http://cshooljs.dynalogue.com/api/memo/' + url,
		type: type,
		data: $('#js_todos').serialize(),
		timeout: 10000,
	}).done(function(data, status, xhr) {
console.log(data);
		//通信の成功時
		for (i = 0, max = data.length; i < max; i++) {
			//TODOデータの取得
			var dataBody = [],
					dataCreated = [],
					dataId = data[i].id,
					dataName = data[i].app_name,
					dataBody = data[i].body,
					dataCreated = data[i].created,
					js_todo_item = '<li class="js_todo_item bx_todo_item"></li>',
					js_todo_form = '<form class="js_todo_form"></form>',
					js_tx_todo = '<label class="js_tx_todo bx_tx_todo">' + dataBody + '</label>',
					js_todo_edit = '<input type="text" class="js_todo_edit bx_input_edit" name="body" value="' + dataBody + '">',
					js_todo_id = '<input type="hidden" class="js_todo_id" name="id" value="' + dataId + '">',
					js_todo_name = '<input type="hidden" class="js_todo_name" name="app_name" value="' + dataName + '">',
					js_btn_up = '<button class="btn js_btn_up">上へ移動</button>',
					js_btn_down = '<button class="btn js_btn_down">下へ移動</button>',
					js_btn_edit = '<button class="btn js_btn_edit">編集</button>',
					js_btn_complete = '<button class="btn js_btn_complete">完了</button>',
					$js_btn_rewrite = $('<button class="btn js_btn_rewrite bx_btn_rewrite">編集</button>'),
					js_add_time = '<p class="tx_add_time js_add_time">' + dataCreated + '</p>',
					todoForm = $(js_todo_form).append(js_tx_todo).append(js_todo_edit).append(js_todo_id).append(js_todo_name),
					todoElm = $(js_todo_item).append(todoForm).append(js_btn_up).append(js_btn_down).append(js_btn_edit).append($js_btn_rewrite).append(js_btn_complete).append(js_add_time);
					$todoElm = (todoElm);
			//TODOをリストに追加する
			$todoElm.prependTo(js_todo_content);
		}

		//リストを囲むul要素を表示する
		$(js_todo_content).show();

		//Completeボタンをクリック
		$($('.js_btn_complete')).on('click', function(){
			var completeId = $(this).parent().find('.js_todo_id').attr('value'),
					completeName = $(this).parent().find('.js_todo_name').attr('value');
			//Ajax通信の設定
			$.ajax({
				url: 'http://cshooljs.dynalogue.com/api/memo/' + completeId + '/?app_name=' + completeName,
				type: 'DELETE',
				data: $(this).parent().find('.js_todo_form').serialize(),
				timeout: 10000,
			}).done(function(data, status, xhr) {
				//通信の成功時
				//テキストを「Complete!」として表示を消す
				$(this).parent().css({'padding': '3em 0 3em 12px', 'fontWeight': 'bold'}).html('Complete!').fadeOut('slow', function() {
					$(this).remove();

					//Todoリストが０になった場合、ul要素を非表示にする
					if ($('.js_todo_item').length === 0) {
						$('#js_todo_content').hide();
					}
				});
			}).fail(function(xhr, status, error) {
debugger;
				//通信の失敗時
				var target = $('<p></p>').insertAfter('#js_todo_tit');
				target.text('エラーです。入力項目が空になっていないか、通信が正しく行われているかご確認いただいてから再度お試しください。').css({'color': 'red', 'fontWeight': 'bold'});
			});
		});

		//ボタンを上に移動する
		//TASK ここを関数化したい && 一番上か下の場合はボタンを無効化 && バグってる
		$('.js_btn_down').on('click', function() {
			$(this).parent().insertAfter($(this).parent().next()).animate({
				opacity: .4
			}, 400, 'linear', function(){
				$(this).css({'opacity': ''});
			});
		});

		//ボタンを下に移動する
		//TASK ここを関数化したい
		$('.js_btn_up').on('click', function() {
			$(this).parent().insertBefore($(this).parent().prev()).animate({
				opacity: .4
			}, 400, 'linear', function(){
				$(this).css({'opacity': ''});
			});
		});

		//Editボタンをクリックして編集可能にする
		$('.js_btn_edit').on('click', function(){
			todoEdit($(this));
		});

		//TODOのテキストをダブルクリックして編集可能にする
		$('.js_tx_todo').on('dblclick', function(){
			todoEdit($(this));
		});

		//テキストを編集可能にするための関数
		function todoEdit (elm) {
			//他にTODO編集中のclassが付いていたら削除する
			if ($('.js_todo_item').hasClass('is_editing')) {
				$('.js_todo_item').removeClass('is_editing')
			}
			var $todoItem = elm.parent('.js_todo_item');

			//TODOに編集中のclassを追加する
			$todoItem.addClass('is_editing');

			//編集終了ボタンが押されたときの処理
			$todoItem.find('.js_btn_rewrite').on('click', function(){
				//Ajax通信の設定
				$.ajax({
					url: 'http://cshooljs.dynalogue.com/api/memo/',
					type: 'PUT',
					data: $('.is_editing').find('.js_todo_form').serialize(),
					timeout: 10000,
				}).done(function(data, status, xhr) {
					//通信の成功時
					var text = data.body;
					$todoItem.find('.js_tx_todo').html(text);
					$todoItem.removeClass('is_editing');
				}).fail(function(xhr, status, error) {
					//通信の失敗時
					var target = $('<p></p>').insertAfter('#js_todo_tit');
					target.text('エラーです。入力項目が空になっていないか、通信が正しく行われているかご確認いただいてから再度お試しください。').css({'color': 'red', 'fontWeight': 'bold'});
				});
			});
		}
	}).fail(function(xhr, status, error) {
		//通信の失敗時
		var target = $('<p></p>').insertAfter('#js_todo_tit');
debugger;
		target.text('エラーです。入力項目が空になっていないか、通信が正しく行われているかご確認いただいてから再度お試しください。').css({'color': 'red', 'fontWeight': 'bold'});
	});
}

//TODOリストが０の場合
if($('.js_todo_item').length === 0) {
	//リストを囲むul要素を非表示にする
	$(js_todo_content).hide();
}

//追加した要素の全削除
$(deleteAllBtn).on('click', function(){
	if (confirm('Are you sure you want to delete all items?')) {
		//ul要素を非表示にして、li要素を削除する
		$(js_todo_content).hide().find('li').remove();

		//全削除ボタンの無効化
		$(deleteAllBtn).css('opacity', '.6').attr('disabled', true);
	}
});

});
