//get all items, push to array
if (document.getElementById('ProductList')) {
    var items = [];
    var unsorted = [];
    $('#contentarea').find('.contentsDiv').each(function() {
        var itemObj = new Object();
        itemObj.itemID = $(this).attr('data-id');
        itemObj.itemName = $(this).attr('data-itemname');
        //itemObj.itemPrice = $(this).attr('data-itemprice');
        itemObj.itemPrice = parseInt($(this).attr('data-itemprice'));
        // if you change the contentsDiv's html, remember to update the following line.
        itemObj.itemHTML = '<div class="contentsDiv has-price" data-itemprice="' + itemObj.itemPrice + '" data-id="' + itemObj.itemID + '" data-itemname="' + itemObj.itemName + '">' + $(this).html() + '</div>';
        items.push(itemObj);
        unsorted.push(itemObj);
    });

    //Pagination
    var header = $(".pageHeader");
    var itemList = $(".productList");
    var buttons = $(".pageList");
    var viewAll = $(".viewAll");

    var itemCount = $(".pageItems");

    var resultsPerPage = 21;
    var currentPage = 0;

    var pages = paginate(resultsPerPage, items);
    pageList(0);

    function pageList(currentPage) {
        var html = [];
        var maxBlocks = 7; // specify the max <li> elements you want rendered
        currentPage = currentPage;
        var numPages = Math.ceil(items.length / resultsPerPage);

        if (numPages > 0) {
            addPageLink = function(page, label, tooltip) {

                var cls = (page == currentPage || page === null) ? 'disabled' : '';
                if ((label - 1) == currentPage) {
                    cls += 'active';
                }
                if ((tooltip == 'Previous page')) {
                    html.push('<li title="', tooltip, '" data-page="', page, '" class="', cls,
                        '"><a href="javascript:prevSort(' + (currentPage) + ')">', label, '</a></li>');

                } else if ((tooltip == 'Next page')) {

                    html.push('<li title="', tooltip, '" data-page="', page, '" class="', cls,
                        '"><a href="javascript:nextSort(' + (page - 1) + ')">', label, '</a></li>');
                } else {
                    html.push('<li title="', tooltip, '" data-page="', page, '" class="', cls,
                        '"><a href="javascript:displayPage2(pages[' + (page - 1) + '], pages)">', label, '</a></li>');
                }
            }

            html.push('<ul>');
            if (numPages > 1 && currentPage > 0) {
                addPageLink(Math.max(1, currentPage - 1), '&laquo; Previous', 'Previous page');
            }

            addPageLink(1, 1, 'First page');
            var maxPivotPages = Math.round((maxBlocks - 5) / 2);
            var minPage = Math.max(2, currentPage - maxPivotPages);
            var maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
            minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));

            for (var i = minPage; i <= maxPage; i++) {
                var isMore = (i == minPage && i != 2) || (i == maxPage && i != numPages - 1);
                if (isMore) {
                    addPageLink(null, '&hellip;');
                } else {
                    console.log("Add Number: " + i);
                    addPageLink(i, i, 'Page ' + i);
                }
            }


            if (numPages > 1) {
                addPageLink(numPages, numPages, 'Last page');
            }
            if (numPages > 1 && currentPage != (numPages - 1)) {

                addPageLink(Math.min(numPages, currentPage + 1), 'Next &raquo;', 'Next page');
            }
            html.push('</ul>');
        }

        $('.pageList').html(html.join(''));
    }


    displayPage(pages[0], pages);

    $('#sortBy').html('<label>Sort By:</label>' +
        '<select id="sortSelect">' +
        '<option value="default">Default</option>' +
        '<option value="nameAsc">Sort by Name (A-Z)</option>' +
        '<option value="nameDsc">Sort by Name (Z-A)</option>' +
        '<option value="priceAsc">Sort by Price (high to low)</option>' +
        '<option value="priceDsc">Sort by Price (low to high)</option>' +
        '</select>');
    $('#sortSelect').change(function() {
        var sp2itemsHTML = "";
        // Sort by Name, Ascending
        $(buttons).html("");
        if ($(this).val() == 'nameAsc') {
            items.sort(dynamicSort('itemName'));
            pages = paginate(resultsPerPage, items);

        } else if ($(this).val() == 'nameDsc') {
            items.sort(dynamicSort('itemName'));
            items.reverse();
            pages = paginate(resultsPerPage, items);
        } else if ($(this).val() == 'priceAsc') {
            items.sort(dynamicSort('itemPrice'));
            items.reverse();
            pages = paginate(resultsPerPage, items);
        } else if ($(this).val() == 'priceDsc') {
            items.sort(dynamicSort('itemPrice'));
            pages = paginate(resultsPerPage, items);
        } else {
            //items.reverse();
            pages = paginate(resultsPerPage, unsorted);
        }


        currentPage = 0;
        nextSort();
        prevSort();
        displayPage(pages[0], pages);
    });


    function take(n, list) {
        return list.slice(0, n);
    }

    function drop(n, list) {
        return list.slice(n);
    }

    function concat(lists) {
        return Array.prototype.concat.apply(this, lists);
    }

    function divide(n, list) {
        if (list.length) {
            var head = take(n, list);
            var tail = drop(n, list);
            return concat.call([head], [divide(n, tail)]);
        } else return [];
    }

    function paginate(n, list) {
        return divide(n, list).map(function(items, index) {
            var number = n * index;
            return {
                start: number + 1,
                end: number + items.length,
                items: items,
                idx: index

            };
        });
    }


    function viewAllItems() {
        var allPages = paginate(items.length, items);
        displayPage(allPages[0], allPages);
        $(".viewAll").text("View Less").attr("onclick", "viewLess()");
        $(".pageList").hide();

    }

    function viewLess() {
        displayPage(pages[0], pages);
        $(".viewAll").text("View All").attr("onclick", "viewAllItems()");
        $(".pageList").show();


    }



    function displayPage(page, pages) {
        $(header).html('<span> ' + (page.idx + 1) + '</span> OF ' + pages.length + ':');
        $('.pageHeader').html('<span> ' + (page.idx + 1) + '</span> OF ' + pages.length + ':');
        $('.pageItems').html(items.length + " Items");
        var results = page.items;
        var resultsHTML = '';
        itemList.start = page.start;
        pageList(page.idx);
        for (var i = 0, len = results.length; i < len; i++) {
            resultsHTML += results[i].itemHTML;
        }
        $('#ProductList').html(resultsHTML);


    }

    function displayPage2(page, pages) {
        $(header).html('<span> ' + (page.idx + 1) + '</span> OF ' + pages.length + ':');
        $('.pageHeader').html('<span> ' + (page.idx + 1) + '</span> OF ' + pages.length + ':');
        $('.pageItems').html(items.length + " Items");
        var results = page.items;
        var resultsHTML = '';
        itemList.start = page.start;
        pageList(page.idx);
        for (var i = 0, len = results.length; i < len; i++) {
            resultsHTML += results[i].itemHTML;
        }
        $('#ProductList').html(resultsHTML);

        $('html, body').animate({
            scrollTop: $("#contentarea").offset().top
        }, 1000);

    }



    function appendChildren(element, children) {
        children.forEach(function(child) {
            element.append(child);
        });
    }



    function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property - property.substr(1);
        }
        return function(a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
            // return result;
        }
    }

    function prevSort(cp) {
        if (cp) {
            currentPage = cp;
        }
        if (currentPage != 0) {
            currentPage = currentPage - 1;
            displayPage(pages[currentPage], pages);
        }
        //pageList(currentPage);
        /*if (currentPage == 0) {
            $('.nav.next').show();
            $('.nav.prev').hide()
        } else {

            $('.nav.next').show();
            $('.nav.prev').show();
        }*/
    }

    function nextSort(cp) {
        if (cp) {
            currentPage = cp;
        }

        if (currentPage < pages.length - 1) {
            currentPage = currentPage + 1;
            displayPage(pages[currentPage], pages);
            //pageList(currentPage);
            /*if (currentPage >= (pages.length - 1)) {
                $('.nav.next').hide();
                $('.nav.prev').show();
            } else {
                $('.nav.next').show();
                $('.nav.prev').show();
            }*/
        }

    }



    // Grid/List View
    function sortView(self, view) {
        if (view === "list") {
            $("#ProductList").removeClass('grid');
            $("#ProductList").addClass('list');
            $(".listView").addClass('selected');
            $('#sortView .gridView').removeClass('selected');
        } else {
            $("#ProductList").removeClass('list');
            $("#ProductList").addClass('grid');
            $(".gridView").addClass('selected');
            $('#sortView .listView').removeClass('selected');
        }
    }
    $("#sortView").html(
        '<button class= "gridView selected" onclick= "sortView(this, \'grid\')" ></button>' +
        '<button class= "listView" onclick= "sortView(this,\'list\')"></button>');

    function compareProducts() {
        var compareItems = [];
        var compareObj;

        $('#contentarea #ProductList').find('input[name="compare"]:checked').parent().parent().each(function() {
            compareObj = new Object();
            compareObj.itemID = $(this).attr('data-id');
            compareObj.itemName = $(this).attr('data-itemname');
            compareObj.itemPrice = $(this).attr('data-itemprice');

            // if you change the contentsDiv's html, remember to update the following line.
            compareObj.itemHTML = '<div class="contentsDiv has-price" data-itemprice="' + compareObj.itemPrice + '" data-id="' + compareObj.itemID + '" data-itemname="' + compareObj.itemName + '">' + $(this).html() + '</div>';
            compareItems.push(compareObj);
            var compareHTML = "";
            for (var i = 0, len = compareItems.length; i < len; i++) {
                compareHTML += compareItems[i].itemHTML;
            }
            $('#ProductList').html(compareHTML);

        });
        if (compareItems.length == 0) {
            alert("Please Select a product");
        }
    }

    $(".sortBar").clone().addClass("sortBar2").insertAfter("#ProductList");
};