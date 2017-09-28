<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLevelsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::create('levels', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('programme_id');
            $table->foreign('programme_id')->references('id')->on('programmes');
            $table->enum('level', ['1', '2', '3', '4']);
            $table->string('level_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('levels');
    }


}
