const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const axios = require("axios");
const cheerio = require("cheerio");

const fs = require("fs");
app.use(express.static('public'));

app.listen((process.env.PORT || 8080) , function () {
    console.log('listening on 8080');
});

app.get('/', function (req, res) {

    let today = new Date();

    let month = today.getMonth() + 1;
    let date = today.getDate();
    let hours = today.getHours();

    let re = month + '월 ' + date + '일 ' + hours + ':00'

    const parsing = async () => {
        try {
            return await axios.get("https://www.melon.com/chart/index.htm");
        }
        catch (error) {
            console.error(error);
        }
    };
    const data_list = []

    parsing()
        .then(html => {
            let ulList = [];
            const $ = cheerio.load(html.data);
            const $bodyList = $("form#frm")
                .children(".service_list_song")
                .children("table")
                .children("tbody")
                .children("tr")

            $bodyList.each(function(i, element) {

                ulList[i] = {

                    rank: $(this).find(
                        'td div.t_center span.rank'
                    ).text(),

                    title: $(this).find(
                        'td div.wrap div.wrap_song_info div.rank01 span a'
                    ).text(),

                    artist: $(this).find(
                        'td div.wrap div.wrap_song_info div.rank02 span a'
                    ).text(),

                    image_url: $(this).find(
                        'td div.wrap a.image_typeAll img'
                    ).attr('src'),

                    rank_move: $(this).find(
                        'td div.wrap span.rank_wrap span.bullet_icons span.none',
                    ).text(),

                    up_value: $(this).find(
                        'td div.wrap span.rank_wrap span.up',
                    ).text(),

                    down_value: $(this).find(
                        'td div.wrap span.rank_wrap span.down',
                    ).text(),

                };
            });

            const data = ulList.filter(n => (n.artist === '임영웅'));
            return data;
        }
    )
    .then(res => {
        console.log(res);
        this.data_list = res;
    });

    res.render('../index.ejs', {
        data: this.data_list,
        time: re
    });

});