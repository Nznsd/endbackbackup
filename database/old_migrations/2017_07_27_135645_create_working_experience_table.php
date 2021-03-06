<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWorkingExperienceTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('working_experience', function (Blueprint $table) {
            $table->increments('id');
            // $table->enum('key', ['std', 'app']);
            $table->string('key');
            $table->string('value');
            $table->string('employer');
            $table->string('position');
            $table->string('desc');
            $table->date('startDate');
            $table->date('endDate');
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
        Schema::dropIfExists('working_experience');
    }
}
