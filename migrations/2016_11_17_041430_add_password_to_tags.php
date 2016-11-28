<?php

use Flarum\Database\Migration;

return Migration::addColumns('tags', [
    'password' => ['string', 'length' => 255, 'nullable' => true]
]);
