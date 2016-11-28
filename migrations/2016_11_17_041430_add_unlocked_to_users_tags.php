<?php

use Flarum\Database\Migration;

return Migration::addColumns('users_tags', [
    'is_unlocked' => ['boolean', 'default' => 0]
]);
