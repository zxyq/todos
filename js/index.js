$(function(){

  var ani = $('#ani');
  $(document).ajaxStart(function(){
    ani.stop(true,true).css({
      width:40,
      opacity:0,
      backgroundColor:'#0d6631'
    });
    ani.animate({opacity:1},20);
  })
  $(document).ajaxSend(function(){
    ani.animate({width:$(window).outerWidth(true)*0.9},200);
  })
  $(document).ajaxSuccess(function(){
    ani.finish().css('backgroundColor','#0575e6').animate({width:$(window).outerWidth(true)},120);
  })
  $(document).ajaxError(function(){
    ani.finish().css('backgroundColor','#e92d1b').animate({width:0},120);
  });
  $(document).ajaxComplete(function(){
    ani.animate({opacity:0},120);
  });

  
  var todos = [];
  // 从服务器读取数据或者从本地取数据
  if( localStorage.todos ){
    todos = $.parseJSON(localStorage.todos);
    render();
  }else{
    $.get({
      url:'/php/getTodo.php',
      dataType:'json'
    }).done(function(data){
      todos = data;
      console.dir(todos);
      render();
    })
  }

  function render(){
    $('#todo-list').empty().append(function(){
      return $.map(todos,function(v){
        return '<li class="'+(v.isDone==='1'?'completed':'')+'" data-id="'+v.id+'"> <div class="view"> <input type="checkbox" '+(v.isDone==='1'?'checked':'')+' class="toggle"> <label>'+v.content+'</label> <button class="destroy"></button> </div> <input type="text" class="edit" value="'+v.content+'"> </li>';
      });
    })
  }

  var addTodo = function (e) {
    var v = $.trim($(this).val());
    if(e.keyCode  !== 13 || v === ''){
      return;
    }
    $(this).val('');
    var todo = {
      id:todos.length?(Math.max.apply(null,$.map(todos,function(v){
        return  v.id;
      })) + 1 + ''):'1001',
      content:v,
      isDone:'0'
    };
    todos.push(todo);
    localStorage.todos = JSON.stringify(todos);
    render();
    $.get({
      url:'php/addTodo.php',
      data:todo,//{id:'12',content:'afadfa',isDone:'1'}
    }).done(function(){
    }).fail(function(){
    })
  }
  $('#new-todo').on('keyup',addTodo);


  var deleteTodo = function(){
    var li = $(this).closest('li');
    var id = li.attr('data-id') ;
    todos = $.grep(todos,function(v){
      return v.id !== id;
    })
    localStorage.todos = JSON.stringify(todos);
    render();
    $.get({
      url:'/php/deleteTodo.php',
      data:{id:id},
    }).done(function(){
    }).fail(function(){
    })
  }
  $('#todo-list').on('click','.destroy',deleteTodo);

  $('#todo-list').on('dblclick','li',function(){
    $(this).addClass('editing');
    var input = $(this).find('.edit');
    //把input原来的值拿出来再次赋值进去，之后调用focus()
    input.val( input.val() ).focus();
  });
  $('#todo-list').on('focusout','.edit',function(){
    $(this).closest('li').removeClass('editing');
  });

  var updateTodo = function() {
    var id =  $(this).closest('li').attr('data-id');
    var value = $(this).val();
    $.each(todos,function(i,v){
      if( v.id === id){
        v.content = value;
      }
    })
    localStorage.todos = JSON.stringify(todos);
    render();
    $.get({
      url:'/php/updateTodo.php',
      data:{id:id,content:value}
    }).done(function(){
    }).fail(function(){
    });
  };
  $('#todo-list').on('change','.edit',updateTodo);

});
